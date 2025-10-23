import { ElementRef, Injectable } from '@angular/core';
import { GameScene, GameSceneProps } from '../../scenes/game';
import { Router } from '@angular/router';
import * as Phaser from 'phaser';

export interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
}

@Injectable({ providedIn: 'root' })
export class Game {
  private gameState: GameState = { score: 0, timeLeft: 150, isPlaying: false }
  private game!: Phaser.Game;

  startGame(score: number, timeLeft: number, gameContainer: ElementRef<HTMLDivElement>, router: Router) {
    this.gameState = { score, timeLeft, isPlaying: true }
    this.initGame(gameContainer, router)
  }

  initGame(gameContainer: ElementRef<HTMLDivElement>, router: Router) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainer.nativeElement,
      transparent: true,
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false, } },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [],
      render: { premultipliedAlpha: false, failIfMajorPerformanceCaveat: false, antialias: true },
      banner: false
    }

    this.game = new Phaser.Game(config);

    this.game.events.once(Phaser.Core.Events.READY, () => {
      const deps: GameSceneProps = {
        score: this.gameState.score,
        timeLeft: this.gameState.timeLeft,
        addScore: this.addScore.bind(this),
        setTimeLeft: this.setTimeLeft.bind(this),
        router
      }

      this.game!.scene.add('GameScene', GameScene, true, deps)
    })

    const queryParams = new URLSearchParams(window.location.search),
          scoreParam = queryParams.get('isNewLive')

    if (scoreParam === 'true') {
      this.gameState.score = Number(localStorage.getItem('score') || '0');
      localStorage.setItem('score', this.gameState.score === 0 ? '0' : String(this.gameState.score - 5));
      this.gameState.timeLeft = Number(localStorage.getItem('time') || '150');
    }
  }

  destroyGame() {
    this.game?.destroy(true);
  }

  getScore() {
    return this.gameState.score;
  }

  getTime() {
    return this.gameState.timeLeft
  }

  resize() {
    setTimeout(() => {
      if (this.game) {
        const parent = document.getElementById('game-container')
        this.game.canvas.width = parent?.clientWidth ?? 0
        this.game.canvas.height = parent?.clientHeight ?? 0
        this.game.scale.refresh();
      }
    }, 1000)
  }

  addScore(points: number) {
    this.gameState.score += points;
    localStorage.setItem('score', String(this.gameState.score));
  }

  setTimeLeft(seconds: number) {
    this.gameState.timeLeft = seconds;
    localStorage.setItem('time', String(seconds));
  }
}
