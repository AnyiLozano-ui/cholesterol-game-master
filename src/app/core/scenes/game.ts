import { Router } from "@angular/router";
import * as Phaser from 'phaser';

export interface GameSceneProps {
    score: number;
    timeLeft: number;
    router: Router;
    addScore: (points: number) => void;
    setTimeLeft: (seconds: number) => void;
}

export interface LastSpawn {
    topAt: number
    bottomAt: number
    topWidth: number
    bottomWidth: number
}

export class GameScene extends Phaser.Scene {
    private assetsRoot: string = 'assets/images';
    private mountainMinDelay: number = 1000;
    private mountainMaxDelay: number = 1500;
    private pairOffsetPx: number = 0;
    private minMountainSpacingPx: number = 0;
    private lastMountainSpawnAt: number = -Infinity;
    private lastMountainSide: 'top' | 'bottom' | null = null;
    private lastMountainWidthPx: number = 0;
    private targetY: number | null = null;
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerSpeed: number = 420;
    private uiButtons: { up: boolean; down: boolean; } = { up: false, down: false };
    private mountainHitboxes!: Phaser.Physics.Arcade.StaticGroup;
    private lastFireAt: number = -Infinity;
    private fireCooldownMs: number = 250;
    private lastSpawn: LastSpawn = {
        topAt: -Infinity,
        bottomAt: -Infinity,
        topWidth: 0,
        bottomWidth: 0,
    };

    private bloodCells!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private capsules!: Phaser.Physics.Arcade.Group;
    private mountainTimer?: Phaser.Time.TimerEvent;
    private topMountainTimer?: Phaser.Time.TimerEvent;
    private bottomMountainTimer?: Phaser.Time.TimerEvent;
    private timeTicker?: Phaser.Time.TimerEvent;
    private addScore!: (points: number) => void;
    private setTimeLeft!: (seconds: number) => void;
    private timeLeft: number = 0;
    private nextSide: 'top' | 'bottom' = (Math.random() < 0.5 ? 'top' : 'bottom');
    private pairTimer?: Phaser.Time.TimerEvent;
    private isPairScheduling = false;
    private lastSideSpawned: 'top' | 'bottom' = 'bottom';

    constructor() { super({ key: 'GameScene' }) }

    init(data: GameSceneProps) {
        this.timeLeft = data.timeLeft;
        this.addScore = data.addScore;
        this.setTimeLeft = data.setTimeLeft;
    }

    preload() {
        const R: string = this.assetsRoot;

        this.load.image('bg-vein-full-screen', `${R}/background-2.png`)
        this.load.image('bg-full', `${R}/vein-background.png`)
        this.load.image('outer-layer', `${R}/outer-layer.png`);
        this.load.image('middle-layer', `${R}/thick_layer.png`);
        this.load.image('high-layer', `${R}/vena.png`);
        this.load.image('top-mountain', `${R}/top-mountain.png`)
        this.load.image('bottom-mountain', `${R}/bottom-montain.png`)
        this.load.image('car', `${R}/car.png`)
        this.load.image('bullet', `${R}/bullet.png`)
        this.load.image('chol_mountain_transparent', `${R}/montain-sin-colesterol.png`)
        this.load.image('pill', `${R}/pill.png`);
        for (let i = 0; i < 10; i++) this.load.image(`bg_cell_${i + 1}`, `${R}/globulo-${i + 1}.png`)
    }

    create() {
        this.setBackground();
        this.generateBloodCells();
        this.startPairedMountains();
        this.createPlayer();
        this.wireDomControls();

        this.mountainHitboxes = this.physics.add.staticGroup({ classType: Phaser.GameObjects.Image });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.topMountainTimer?.remove(false);
            this.bottomMountainTimer?.remove(false);
        })

        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 40,
            runChildUpdate: false
        });

        (this.bullets as Phaser.Physics.Arcade.Group).children.each((go: Phaser.GameObjects.GameObject) => {
            const img = go as Phaser.Physics.Arcade.Image;
            (img!.body as any).allowGravity = false;
            img.setCollideWorldBounds(false);
            return null;
        });

        this.physics.add.overlap(
            this.bullets,
            this.mountainHitboxes,
            this.onBulletHitsMountain as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            this.processBulletVsMountain as any,
            this
        );

        this.capsules = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            allowGravity: false,
            immovable: false,
            maxSize: 20,
            runChildUpdate: false
        });

        this.physics.add.overlap(
            this.player,
            this.mountainHitboxes,
            () => this.onPlayerHitsMountain(),               // collide-callback
            this.processPlayerVsMountainPixel as any,       // process-callback (boolean)
            this
        );

        this.physics.add.overlap(
            this.player,
            this.capsules,
            this.onPlayerCollectsCapsule as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            (player, mtn) => !(mtn as Phaser.GameObjects.Image).getData('neutralized'),
            this
        );

        this.input.keyboard?.on('keydown-SPACE', () => this.tryFire());

        this.wireFireButton();
        this.handleTimerLeft();
        this.handleSetPrincipalBackground()
        this.scale.on('resize', () => {
            if (!this.player) return;
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            const halfH = body ? body.height / 2 : this.player.displayHeight / 2;
            const { minY, maxY } = this.getInnerCorridorBounds();
            this.player.y = Phaser.Math.Clamp(this.player.y, minY + halfH, maxY - halfH);
        });
    }

    override update(_time: number, delta: number) {
        if (!this.player) return;

        let vy = 0;

        if (this.cursors?.up.isDown) vy = -this.playerSpeed;
        else if (this.cursors?.down.isDown) vy = this.playerSpeed;

        if (this.uiButtons.up) vy = -this.playerSpeed;
        if (this.uiButtons.down) vy = this.playerSpeed;
        if (vy === 0 && this.targetY !== null && !(this.cursors?.up.isDown || this.cursors?.down.isDown)) {
            const dy = this.targetY - this.player.y;
            vy = Phaser.Math.Clamp(dy * 5, -this.playerSpeed, this.playerSpeed);
        }

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const halfH = body ? body.height / 2 : this.player.displayHeight / 2;
        const { minY, maxY } = this.getInnerCorridorBounds();
        const EPS = 0.5;

        const atTop = this.player.y <= minY + halfH + EPS;
        const atBottom = this.player.y >= maxY - halfH - EPS;

        if (atTop && vy < 0) vy = 0;
        if (atBottom && vy > 0) vy = 0;

        this.player.setVelocityY(vy);

        this.player.y = Phaser.Math.Clamp(this.player.y, minY + halfH, maxY - halfH);

        this.bullets.children.each((obj: Phaser.GameObjects.GameObject) => {
            const bullet = obj as Phaser.Physics.Arcade.Image;
            if (!bullet.active) return null;
            if (bullet.x > this.scale.width + 120 || bullet.x < -120) bullet.destroy();
            return null;
        });

        this.capsules?.children.each((obj) => {
            const c: Phaser.Physics.Arcade.Image = obj as Phaser.Physics.Arcade.Image;
            if (c.active && c.x < -120) c.destroy();
            return null;
        });

   
    }
    private processPlayerVsMountainPixel(
        playerGO: Phaser.GameObjects.GameObject,
        mountainGO: Phaser.GameObjects.GameObject
    ): boolean {
        const player = playerGO as Phaser.Physics.Arcade.Sprite;
        const mountain = mountainGO as Phaser.GameObjects.Image;

        if (!player.active || !mountain.active) return false;
        if (mountain.getData('neutralized')) return false;

        // 1) AABB rápido
        const pb = player.getBounds();
        const mb = mountain.getBounds();
        const aabb =
            pb.right > mb.left && pb.left < mb.right && pb.bottom > mb.top && pb.top < mb.bottom;
        if (!aabb) return false;

        // 2) Intersección en mundo
        const ix = Math.max(pb.left, mb.left);
        const iy = Math.max(pb.top, mb.top);
        const iw = Math.min(pb.right, mb.right) - ix;
        const ih = Math.min(pb.bottom, mb.bottom) - iy;
        if (iw <= 0 || ih <= 0) return false;

        // 3) Datos de texturas y escalas
        const pFrame = player.frame as Phaser.Textures.Frame;
        const pTexKey = player.texture.key;
        const pFrameName = pFrame.name;
        const pSx = player.scaleX || 1;
        const pSy = player.scaleY || 1;
        const pTopLeft = player.getTopLeft();

        const mFrame = mountain.frame as Phaser.Textures.Frame;
        const mTexKey = mountain.texture.key;
        const mFrameName = mFrame.name;
        const mSx = mountain.scaleX || 1;
        const mSy = mountain.scaleY || 1;
        const mTopLeft = mountain.getTopLeft();

        // 4) Ignorar “cap” superior en montañas bottom
        const side: 'top' | 'bottom' = mountain.getData('side') || 'bottom';
        const ignoreCapPx = Math.max(6, Math.floor(mFrame.cutHeight * 0.06)); // ~6% o 6px

        // 5) Barrido por píxel (salto >1 para rendimiento)
        const STEP = 2;           // sube/baja para precisión vs rendimiento
        const ALPHA_THR = 10;     // tolerancia a semitransparencias

        for (let wy = iy; wy < iy + ih; wy += STEP) {
            for (let wx = ix; wx < ix + iw; wx += STEP) {
                // -> coords locales player
                const plx = (wx - pTopLeft.x) / pSy * (pSy / pSy); // (evita warning; usamos pSx/pSy abajo)
                const ply = (wy - pTopLeft.y) / pSy;

                const pLocalX = (wx - pTopLeft.x) / pSx;
                const pLocalY = (wy - pTopLeft.y) / pSy;
                if (pLocalX < 0 || pLocalY < 0 || pLocalX >= pFrame.cutWidth || pLocalY >= pFrame.cutHeight) {
                    continue;
                }
                const pTexX = Math.floor(pFrame.cutX + pLocalX);
                const pTexY = Math.floor(pFrame.cutY + pLocalY);
                const pAlpha = this.textures.getPixelAlpha(pTexX, pTexY, pTexKey, pFrameName);
                if (pAlpha <= ALPHA_THR) continue; // píxel del player es transparente => no hay choque

                // -> coords locales montaña
                const mLocalX = (wx - mTopLeft.x) / mSx;
                const mLocalY = (wy - mTopLeft.y) / mSy;
                if (mLocalX < 0 || mLocalY < 0 || mLocalX >= mFrame.cutWidth || mLocalY >= mFrame.cutHeight) {
                    continue;
                }

                // “cap” superior ignorado para bottom:
                if (side === 'bottom' && mLocalY <= ignoreCapPx) {
                    continue; // rozó la cresta superior, no cuenta
                }

                const mTexX = Math.floor(mFrame.cutX + mLocalX);
                const mTexY = Math.floor(mFrame.cutY + mLocalY);
                const mAlpha = this.textures.getPixelAlpha(mTexX, mTexY, mTexKey, mFrameName);
                if (mAlpha > ALPHA_THR) {
                    // ambos píxeles opacos => choque real
                    return true;
                }
            }
        }

        return false;
    }

    /** ============== Eventos del carro ============== */
    private processPlayerVsMountain(
        playerGO: Phaser.GameObjects.GameObject,
        mountainGO: Phaser.GameObjects.GameObject
    ): boolean {
        console.log(playerGO)
        const player = playerGO as Phaser.Physics.Arcade.Sprite,
            mountain = mountainGO as Phaser.GameObjects.Image,
            pb = player.getBounds(),
            mb = mountain.getBounds(),
            verticalOverlap = pb.bottom > mb.top && pb.top < mb.bottom;

        if (mountain.getData('neutralized')) return false;

        if (!verticalOverlap) return !verticalOverlap;

        const mountainLeft = mb.left,
            mountainWidth = mb.width || 1,
            penetrationPx = Math.max(0, pb.right - mountainLeft),
            penetrationPct = penetrationPx / mountainWidth;

        return penetrationPct === 1;
    }

    private onPlayerHitsMountain() {
        window.location.href = "/failed"
    }

    /** ========== Funciones de eventos para las pastillas ========== */
    private processBulletVsMountain(
        bulletGO: Phaser.GameObjects.GameObject,
        mountainGO: Phaser.GameObjects.GameObject
    ): boolean {
        const bullet = bulletGO as Phaser.Physics.Arcade.Image;
        const mountain = mountainGO as Phaser.GameObjects.Image;

        if (mountain.getData('neutralized')) return false;

        const bb = bullet.getBounds();
        const mb = mountain.getBounds();

        // 1) solape vertical (rápido)
        const verticalOverlap = bb.bottom > mb.top && bb.top < mb.bottom;
        if (!verticalOverlap) return false;

        // 2) verificación por píxel (precisa)
        return this.bulletHitsOpaquePixel(bullet, mountain);
    }

    private onBulletHitsMountain = (
        bulletGO: Phaser.GameObjects.GameObject,
        mountainGO: Phaser.GameObjects.GameObject
    ): void => {
        const bullet = bulletGO as Phaser.Physics.Arcade.Image;
        const mountain = mountainGO as Phaser.GameObjects.Image;

        if (mountain.getData('neutralized')) return;

        // Re-confirma golpe por píxel
        if (!this.bulletHitsOpaquePixel(bullet, mountain)) return;

        const hits: number = (mountain.getData('hits') ?? 0) + 1;
        mountain.setData('hits', hits);
        bullet.destroy();

        if (hits >= 2 && !mountain.getData('neutralized')) {
            mountain.setData('neutralized', true);

            const tw: Phaser.Tweens.Tween | undefined = mountain.getData('tween');
            if (tw && tw.isPlaying()) tw.stop();

            this.tweens.add({
                targets: mountain,
                alpha: { from: 1, to: 0.3 },
                duration: 60,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    if (mountain.active) mountain.destroy();
                    this.spawnCapsuleFromMountain(mountain);
                }
            });
        }
    };

    private neutralizeMountain(mountain: Phaser.GameObjects.Image): void {
        if (!mountain.getData('shining')) {
            mountain.setData('shining', true);

            this.tweens.add({
                targets: mountain,
                alpha: { from: 1, to: 0.3 },
                duration: 50,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    mountain.destroy()

                    this.spawnCapsuleFromMountain(mountain);
                }
            });
        }
    }

    /** ========== Funciones Capsulas de puntos ========== */
    private spawnCapsuleFromMountain(mountain: Phaser.GameObjects.Image) {
        const { minY, maxY } = this.getInnerCorridorBounds();
        const corridorCenterY = (minY + maxY) / 2;

        const mb = mountain.getBounds();
        const spawnX = mb.centerX;
        const spawnY = Phaser.Math.Clamp(mb.centerY, minY + 10, maxY - 10);

        const cap = this.capsules.get(spawnX, spawnY, 'pill') as Phaser.Physics.Arcade.Image;
        if (!cap) return;

        cap.setActive(true).setVisible(true);
        cap.setDepth(22);
        cap.setScale(0.55);

        cap.setData('collected', false);

        const body = cap.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
        body.allowGravity = false;
        body.reset(spawnX, spawnY);

        cap.setVelocityX(-1000);
        body.setMaxVelocity(100, 100);
        body.setSize(cap.width * 0.8, cap.height * 0.8, true);

        this.tweens.add({
            targets: cap,
            y: corridorCenterY,
            duration: 60,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                const amplitude = Math.min(20, (maxY - minY) * 0.12);
                this.tweens.add({
                    targets: cap,
                    y: { from: corridorCenterY - amplitude, to: corridorCenterY + amplitude },
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        this.time.delayedCall(15000, () => {
            if (cap.active && cap.x < -100) cap.destroy();
        });
    }

    private onPlayerCollectsCapsule(
        _playerGO: Phaser.GameObjects.GameObject,
        capsuleGO: Phaser.GameObjects.GameObject
    ) {
        const capsule = capsuleGO as Phaser.Physics.Arcade.Image;

        if (capsule.getData('collected')) return;
        capsule.setData('collected', true);

        this.physics.world.disable(capsule);
        (capsule.body as Phaser.Physics.Arcade.Body | undefined)?.checkCollision &&
            ((capsule.body as Phaser.Physics.Arcade.Body).checkCollision.none = true);

        if (this.addScore) this.addScore(5);

        this.tweens.add({
            targets: capsule,
            alpha: 0,
            scale: 0.3,
            duration: 250,
            ease: 'Sine.easeInOut',
            onComplete: () => this.handleObtainCapsule(capsule)
        });
    }

    private handleObtainCapsule(capsule: Phaser.Physics.Arcade.Image): void {
        capsule.destroy();
    }

    private startPairedMountains() {
        this.scheduleNextPair(true);
    }

    private scheduleNextPair(initial = false) {
        if (this.isPairScheduling) return;          // anti-reentrada
        this.isPairScheduling = true;

        // velocidad en px/ms basada en tu tween (x: W+150 -> -600, dur: 12000)
        const W = this.scale.width;
        const dist = (W + 150) - (-600);            // = W + 750
        const pxPerMs = dist / 12000;

        const baseDelay = initial
            ? 2000
            : Phaser.Math.Between(this.mountainMinDelay, this.mountainMaxDelay);

        // Forzamos alternancia del primer lado del par respecto al último que spawneó
        const first: 'top' | 'bottom' = this.lastSideSpawned === 'top' ? 'bottom' : 'top';
        const second: 'top' | 'bottom' = first === 'top' ? 'bottom' : 'top';

        const spawnFirst = () => {
            const m1 = this.spawnMountain(first);
            this.lastSideSpawned = first;

            // gap entre la primera y la segunda del par
            const desiredGapPx = this.pairOffsetPx; // puedes dejar 0 o subirlo a gusto
            const offsetMs = Math.ceil((m1.displayWidth + desiredGapPx) / pxPerMs);

            // programa la segunda del par al otro lado
            this.pairTimer?.remove(false);
            this.pairTimer = this.time.addEvent({
                delay: offsetMs,
                loop: false,
                callback: () => {
                    const m2 = this.spawnMountain(second);
                    this.lastSideSpawned = second;

                    // cuando termina el par, liberamos y agendamos el siguiente
                    this.isPairScheduling = false;
                    this.pairTimer = this.time.addEvent({
                        delay: baseDelay,
                        loop: false,
                        callback: () => this.scheduleNextPair(false)
                    });
                }
            });
        };

        // dispara la primera del par
        this.pairTimer?.remove(false);
        this.pairTimer = this.time.addEvent({
            delay: baseDelay,
            loop: false,
            callback: spawnFirst
        });
    }

    private scheduleNextForSide(side: 'top' | 'bottom', initial = false) {
        const now = this.time.now;
        const pxPerMs = this.getMountainPxPerMs();

        const baseDelay = initial
            ? 2000
            : Phaser.Math.Between(this.mountainMinDelay, this.mountainMaxDelay);

        const lastAt = side === 'top' ? this.lastSpawn.topAt : this.lastSpawn.bottomAt;
        const lastW = side === 'top' ? this.lastSpawn.topWidth : this.lastSpawn.bottomWidth;

        const requiredPxGap = Math.max(0, lastW + this.minMountainSpacingPx);
        const minGapMs = Math.ceil(requiredPxGap / pxPerMs);

        const elapsed = now - lastAt;
        const extraDelay = Number.isFinite(elapsed) ? Math.max(0, minGapMs - elapsed) : 0;
        const delay = baseDelay + extraDelay;

        if (side === 'top') {
            this.topMountainTimer?.remove(false);
            this.topMountainTimer = this.time.addEvent({
                delay,
                loop: false,
                callback: () => {
                    const m = this.spawnMountain('top');
                    this.lastSpawn.topAt = this.time.now;
                    this.lastSpawn.topWidth = m.displayWidth;
                    this.scheduleNextForSide('top', false);
                }
            });
        } else {
            this.bottomMountainTimer?.remove(false);
            this.bottomMountainTimer = this.time.addEvent({
                delay,
                loop: false,
                callback: () => {
                    const m = this.spawnMountain('bottom');
                    this.lastSpawn.bottomAt = this.time.now;
                    this.lastSpawn.bottomWidth = m.displayWidth;
                    this.scheduleNextForSide('bottom', false);
                }
            });
        }
    }

    private setBackground(): void {
        const { width: W, height: H } = this.scale,
            overlay: Phaser.GameObjects.Image = this.add.image(W / 2, H / 2, 'bg-full')
                .setDepth(-10)
                .setScrollFactor(0)
                .setOrigin(0.5, 0.5),
            iw: number = overlay.width,
            ih: number = overlay.height,
            scale: number = Math.min(W / iw, H / ih)

        overlay.setScale(scale)

        this.scale.on('resize', (size: Phaser.Structs.Size) => {
            const s: number = Math.min(size.width / iw, size.height / ih);
            overlay.setPosition(size.width / 2, size.height / 2).setScale(s)
        })
    }

    private generateBloodCells() {
        const W: number = this.scale.width,
            H: number = this.scale.height;

        this.bloodCells = this.physics.add.group({ allowGravity: false, immovable: true })
        this.time.addEvent({
            delay: 400,
            loop: true,
            callback: () => this.spawnBloodCell(W, H)
        })
    }

    private spawnBloodCell(W: number, H: number) {
        const type: number = Phaser.Math.Between(1, 10),
            spriteKey: string = `bg_cell_${type}`,
            y: number = Phaser.Math.Between(H * 0.25, H * 0.7),
            scale: number = Phaser.Math.FloatBetween(0.05, 0.1),
            baseSpeed: number = Phaser.Math.Between(100, 200),
            speed: number = (baseSpeed / 20) / scale,
            cell: Phaser.Physics.Arcade.Sprite = this.bloodCells.create(W + 60, y, spriteKey);

        cell.setOrigin(0.5);
        cell.setScale(scale);
        cell.setDepth(Phaser.Math.Between(1, 3));
        cell.setVelocityX(-speed);
        cell.setAlpha(Phaser.Math.FloatBetween(0.7, 1));
    }

    /** ========== Funciones de las montanas de colesterol ========== */
    private spawnMountain(side: 'top' | 'bottom'): Phaser.GameObjects.Image {
        const W = this.scale.width;
        const H = this.scale.height;

        // Posición y escala visuales
        const y = this.getYPositionMountain(side, W, H);
        const originY = side === 'top' ? 0 : 1;
        const key = side === 'top' ? 'top-mountain' : 'bottom-mountain';
        const scale = this.getMountainScale(W);

        // Crea imagen normal y le añade cuerpo ESTÁTICO
        const mountain = this.add.image(W + 150, y, key)
            .setOrigin(0, originY)
            .setDepth(12)
            .setScale(scale);

        mountain.setData({ hits: 0, shining: false, neutralized: false, side });

        // Cuerpo estático y lo “sincronizamos” con la imagen
        this.physics.add.existing(mountain, true);
        const body = mountain.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(mountain.displayWidth, mountain.displayHeight, true);
        body.updateFromGameObject();

        // Recorta hitbox para evitar transparencia del PNG
        this.tuneMountainHitbox(mountain, side);

        // Añade al StaticGroup para colisiones
        this.mountainHitboxes.add(mountain);

        // Mueve la montaña con un tween y ACTUALIZA el cuerpo en cada frame
        const tw = this.tweens.add({
            targets: mountain,
            x: -600,
            duration: 12000,
            ease: 'Linear',
            onUpdate: () => {
                // 🔒 Blindaje: si ya no hay body (o la montaña ya murió), salir.
                const b = mountain.body as Phaser.Physics.Arcade.StaticBody | null | undefined;
                if (!b || !mountain.active) return;
                b.updateFromGameObject();
            },
            onComplete: () => {
                if (mountain.active) mountain.destroy();
            }
        });
        mountain.setData('tween', tw);

        return mountain;
    }

    private tuneMountainHitbox(mountain: Phaser.GameObjects.Image, side: 'top' | 'bottom') {
        const body = mountain.body as Phaser.Physics.Arcade.StaticBody;
        const w = mountain.displayWidth;
        const h = mountain.displayHeight;

        // Recortes para eliminar padding y quedarnos con la “masa” visible
        const insetLeft = 0.50;                  // 35% desde la izquierda
        const insetRight = 0.05;                  // 5% desde la derecha
        const insetTop = side === 'top' ? 0.55 : 0.00; // recorta punta superior
        const insetBottom = side === 'bottom' ? 0.55 : 0.00; // recorta base inferior

        const hitW = w * (1 - insetLeft - insetRight);
        const hitH = h * (1 - insetTop - insetBottom);
        const offX = w * insetLeft;
        const offY = h * insetTop;

        body.setSize(hitW, hitH, false);
        body.setOffset(offX, offY);
        body.updateFromGameObject();
    }

    private getMountainScale(width: number): number {
        if (width >= 768) return 0.8
        if (width >= 667 && width < 768) return 0.6
        return 0.5
    }

    private getYPositionMountain(side: 'top' | 'bottom', width: number, height: number): number {
        if (width >= 1366) if (side === 'top') return height * 0.205; else return height * 0.784
        if (width >= 1180 && width < 1366) if (side === 'top') return height * 0.235; else return height * 0.754
        if (width >= 1024 && width < 1180) if (side === 'top') return height * 0.275; else return height * 0.724
        if (width >= 915 && width < 1024) if (side === 'top') return height * 0.105; else return height * 0.894
        if (width >= 844 && width < 915) if (side === 'top') return height * 0.115; else return height * 0.884
        if (width >= 820 && width < 844) if (side === 'top') return height * 0.295; else return height * 0.694
        if (width >= 768 && width < 820) if (side === 'top') return height * 0.295; else return height * 0.694
        if (width >= 740 && width < 768) if (side === 'top') return height * 0.155; else return height * 0.834
        if (width >= 667 && width < 740) if (side === 'top') return height * 0.185; else return height * 0.814
        return 0
    }

    private scheduleNextMountain(initial = false): void {
        const now = this.time.now,
            pxPerMs = this.getMountainPxPerMs(),
            baseDelay = initial
                ? 2000
                : Phaser.Math.Between(this.mountainMinDelay, this.mountainMaxDelay),
            requiredPxGap = Math.max(0, this.lastMountainWidthPx + this.minMountainSpacingPx),
            minGapMs = Math.ceil(requiredPxGap / pxPerMs),
            elapsed = now - this.lastMountainSpawnAt,
            extraDelay = Number.isFinite(elapsed) ? Math.max(0, minGapMs - elapsed) : 0,
            delay = baseDelay + extraDelay;

        this.mountainTimer?.remove(false);
        this.mountainTimer = this.time.addEvent({
            delay,
            loop: false,
            callback: () => this.alternateMountainPosition()
        });
    }

    private alternateMountainPosition(): void {
        const side: 'top' | 'bottom' =
            this.lastMountainSide === null
                ? (Phaser.Math.Between(0, 1) === 0 ? 'top' : 'bottom')
                : (this.lastMountainSide === 'top' ? 'bottom' : 'top');

        const mountain = this.spawnMountain(side);
        this.lastMountainSide = side;
        this.lastMountainWidthPx = mountain.displayWidth;

        this.lastMountainSpawnAt = this.time.now;
        this.scheduleNextMountain(false);
    }

    private getMountainPxPerMs(): number {
        const W = this.scale.width;
        const totalDist = W + 750;
        return totalDist / 12000;
    }

    /** ========== Funciones para los controles del juego ========== */
    private wireDomControls() {
        const resolveEl: (sel: string) => HTMLElement | null =
            (sel: string): HTMLElement | null => {
                const host = document.querySelector(sel) as any;
                if (!host) return null;
                return (host.shadowRoot?.querySelector('button') as HTMLElement) || (host as HTMLElement);
            };

        const upEl: HTMLElement | null = resolveEl('.up-button'),
            downEl: HTMLElement | null = resolveEl('.down-button');

        const press: (dir: 'up' | 'down') => void =
            (dir: 'up' | 'down') => {
                this.uiButtons[dir] = true;
                this.targetY = null;
            };

        const release: (dir: 'up' | 'down') => boolean =
            (dir: 'up' | 'down') => this.uiButtons[dir] = false;
        const releaseAll: VoidFunction = () => {
            this.uiButtons.up = false;
            this.uiButtons.down = false;
        };

        const bind: (el: HTMLElement | null, dir: "up" | "down") => void =
            (el: HTMLElement | null, dir: 'up' | 'down') => {
                if (!el) return;
                el.style.touchAction = 'none';
                el.addEventListener('pointerdown', () => press(dir));
                el.addEventListener('pointerup', () => release(dir));
                el.addEventListener('pointerleave', () => release(dir));
                el.addEventListener('pointercancel', () => release(dir));

                el.addEventListener('mousedown', () => press(dir));
                el.addEventListener('mouseup', () => release(dir));
                el.addEventListener('mouseleave', () => release(dir));

                el.addEventListener('touchstart', (e) => { e.preventDefault(); press(dir); }, { passive: false });
                el.addEventListener('touchend', () => release(dir));
                el.addEventListener('touchcancel', () => release(dir));
            };

        bind(upEl, 'up');
        bind(downEl, 'down');

        window.addEventListener('pointerup', releaseAll);
        window.addEventListener('touchend', releaseAll);
        window.addEventListener('pointercancel', releaseAll);
        window.addEventListener('blur', releaseAll);
        document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
    }

    /** ========== Funciones para la creacion del player (El Carrito) */
    private createPlayer(): void {
        const H = this.scale.height,
            W: number = this.scale.width;

        this.player = this.physics.add.sprite(W * 0.23, H / 2, 'car')
            .setDepth(20)
            .setScale(this.getPlayerScale(this.scale.width));

        (this.player.body as any).allowGravity = false;

        this.player.setCollideWorldBounds(true);

        this.player.body!.setSize(this.player.width * 0.7, this.player.height * 0.7, true);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    private getPlayerScale(width: number): number {
        if (width >= 1024) return 0.8
        if (width >= 820 && width < 1024) return 0.7
        if (width >= 768 && width < 820) return 0.6
        if (width >= 666 && width < 768) return 0.5
        return 0
    }

    private getInnerCorridorBounds(): { minY: number; maxY: number } {
        const { width, height } = this.scale

        if (width >= 1366) return { minY: height * 0.25, maxY: height * 0.76 }
        if (width >= 1180 && width < 1366) return { minY: height * 0.29, maxY: height * 0.72 }
        if (width >= 1024 && width < 1180) return { minY: height * 0.32, maxY: height * 0.69 }
        if (width >= 915 && width < 1024) return { minY: height * 0.25, maxY: height * 0.798 }
        if (width >= 740 && width < 915) return { minY: height * 0.25, maxY: height * 0.795 }
        return { minY: 0, maxY: 1 }
    }

    private wireFireButton(): void {
        const fireImg: HTMLImageElement | null = document.querySelector<HTMLImageElement>('.gun');

        if (!fireImg) return;

        fireImg.draggable = false;
        fireImg.style.touchAction = 'none';
        fireImg.style.pointerEvents = 'auto';

        const fire = (e?: Event) => { e?.preventDefault(); this.tryFire(); };

        fireImg.addEventListener('pointerdown', fire);
        fireImg.addEventListener('touchstart', fire, { passive: false });
        fireImg.addEventListener('click', fire);
    }

    private tryFire(): void {
        const now: number = this.time.now;
        if (now - this.lastFireAt < this.fireCooldownMs) return;
        this.lastFireAt = now;
        this.fireFromPlayer();
    }

    private fireFromPlayer(): void {
        if (!this.player) return;

        const pb: Phaser.Geom.Rectangle = this.player.getBounds(),
            spawnX: number = pb.right + 10,
            spawnY: number = pb.centerY,
            b: Phaser.Physics.Arcade.Image =
                this.bullets.get(spawnX, spawnY, 'bullet') as Phaser.Physics.Arcade.Image;

        if (!b) return;

        b.setActive(true).setVisible(true);
        b.setDepth(25).setScale(0.6);

        const body: Phaser.Physics.Arcade.Body = b.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
        body.allowGravity = false;
        body.setBounce(0).setDrag(0);
        body.reset(spawnX, spawnY);

        b.setVelocityX(900);

        body.setMaxVelocity(900, 0);
        body.setSize(b.width * 0.6 + 12, b.height * 0.6, true);

        this.time.delayedCall(5000, () => {
            if (!b.active) return;
            b.destroy();
        });
    }

    /** ========== Funcion para el cronometro ========== */
    private handleTimerLeft(): void {
        this.timeTicker?.remove(false);
        this.timeTicker = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.handleTimeLeft()
        })
    }

    private handleTimeLeft(): void {
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.setTimeLeft?.(this.timeLeft);
            this.timeTicker?.remove(false);
            const score = Number(localStorage.getItem('score') || '0');
            if (score && score >= 75) window.location.href = "/success"
            else window.location.href = "/game-over"
        } else {
            this.timeLeft -= 1;
            this.setTimeLeft?.(this.timeLeft);
        }
    }

    /** ========== Principal Background Logic ========== */
    private handleSetPrincipalBackground(): void {
        const { width: W, height: H } = this.scale,
            overlay: Phaser.GameObjects.Image = this.add.image(W / 2, H / 2, 'bg-vein-full-screen')
                .setScrollFactor(0)
                .setDepth(9999)
                .setOrigin(0.5, 0.5),
            iw: number = overlay.width,
            ih: number = overlay.height,
            scale: number = Math.min(W / iw, H / ih);

        overlay.setScale(scale)

        this.scale.on('resize', (size: Phaser.Structs.Size) => {
            const s: number = Math.min(size.width / iw, size.height / ih);
            overlay.setPosition(size.width / 2, size.height / 2).setScale(s)
        })
    }

    private bulletHitsOpaquePixel(
        bullet: Phaser.Physics.Arcade.Image,
        mountain: Phaser.GameObjects.Image
    ): boolean {
        if (mountain.getData('neutralized')) return false;

        const bb = bullet.getBounds();

        // posición superior-izquierda de la imagen en mundo, ya con origin/escala aplicados
        const topLeft = mountain.getTopLeft();

        const sx = mountain.scaleX || 1;
        const sy = mountain.scaleY || 1;

        const frame = mountain.frame as Phaser.Textures.Frame;
        const texKey = mountain.texture.key;
        const frameName = frame.name; // puede ser string o número

        // muestreamos 3x3 puntos del rect del bullet
        const xs = [bb.left, bb.centerX, bb.right];
        const ys = [bb.top, bb.centerY, bb.bottom];

        for (const x of xs) {
            for (const y of ys) {
                // punto del mundo -> coordenadas locales dentro del frame (antes de escala)
                const localX = (x - topLeft.x) / sx;
                const localY = (y - topLeft.y) / sy;

                // fuera del frame visible -> saltar
                if (
                    localX < 0 || localY < 0 ||
                    localX >= frame.cutWidth || localY >= frame.cutHeight
                ) continue;

                // convertir a coords absolutas dentro de la textura fuente (sumar cutX/cutY)
                const texX = Math.floor(frame.cutX + localX);
                const texY = Math.floor(frame.cutY + localY);

                // Leer alpha vía TextureManager (¡éste sí está tipado!)
                const alpha = this.textures.getPixelAlpha(texX, texY, texKey, frameName);

                if (alpha > 10) return true; // umbral bajo para tolerar semitransparencias
            }
        }
        return false;
    }
}