import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { SceneComponent } from './scene/scene.component';
import { TextAreaComponent } from './text-area/text-area.component';

@NgModule({
  declarations: [
    AppComponent,
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
