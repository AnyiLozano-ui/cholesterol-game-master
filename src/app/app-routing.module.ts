import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'game',
    loadComponent: () => import('./game/game.page').then(m => m.GamePage)
  },
  {
    path: 'failed',
    loadComponent: () => import('./screens/failed/failed.page').then(m => m.FailedPage)
  },
  {
    path: 'question',
    loadComponent: () => import('./screens/question/question.page').then( m => m.QuestionPage)
  },
  {
    path: 'game-over',
    loadComponent: () => import('./screens/game-over/game-over.page').then(m => m.GameOverPage)
  },
  {
    path: 'success',
    loadComponent: () => import('./screens/success/success.page').then(m => m.SuccessPage)
  },
  {
    path: 'congratulations',
    loadChildren: () => import('./congratulations/congratulations.module').then( m => m.CongratulationsPageModule)
  },
  {
    path: 'score',
    loadChildren: () => import('./score/score.module').then( m => m.ScorePageModule)
  },
  
  {
    path: 'instructions',
    loadChildren: () => import('./instructions/instructions.module').then( m => m.InstructionsPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
