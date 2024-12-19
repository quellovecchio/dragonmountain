import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DiyComponent } from './editor/diy/diy.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', component: GameComponent },
  { path: 'diy', component: DiyComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
