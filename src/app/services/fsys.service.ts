import { Injectable } from '@angular/core';

export interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState: GameState = {
    score: 0,
    timeLeft: 90,
    isPlaying: false
  };

  constructor() {}

  startGame() {
    this.gameState = {
      score: 0,
      timeLeft: 90,
      isPlaying: true
    };
  }

  getCurrentGameState(): GameState {
    return { ...this.gameState };
  }

  updateGameState(newState: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...newState };
  }

  addScore(points: number) {
    this.gameState.score += points;
    if (this.gameState.score > 100) {
      this.gameState.score = 100;
    }
  }

  updateTimeLeft(timeLeft: number) {
    this.gameState.timeLeft = timeLeft;
  }

  getScore(): number {
    return this.gameState.score;
  }

  getTimeLeft(): number {
    return this.gameState.timeLeft;
  }
}