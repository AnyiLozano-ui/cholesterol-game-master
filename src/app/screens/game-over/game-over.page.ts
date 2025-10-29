import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.page.html',
  styleUrls: ['./game-over.page.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})
export class GameOverPage {
  public winTheGame: boolean = false;
  public quantity: number = 0;

  constructor() { }

  ionViewDidEnter() {
    const score: number = Number(localStorage.getItem('score') || '0');
    this.winTheGame = score >= 100
    this.quantity = score
  }

  handleGoToHome(): void {
    localStorage.removeItem('score');
    localStorage.removeItem('time');
    window.location.href = '/';
  }
}
