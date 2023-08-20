import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { LocationPreviewComponent } from './location-preview/location-preview.component';
import { SceneComponent } from './scene/scene.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { ViewportComponent } from './viewport/viewport.component';
import { LocationComponent } from './location/location.component';
import { FightComponent } from './fight/fight.component';
import { HttpClientModule } from '@angular/common/http';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { InventoryComponent } from './info-box/inventory/inventory.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';


@NgModule({
  declarations: [
    AppComponent,
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    ViewportComponent,
    LocationPreviewComponent,
    LocationComponent,
    FightComponent,
    ActionBarComponent,
    InventoryComponent,
    ContextMenuComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatCardModule
  ],
  exports: [
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    LocationPreviewComponent
  ],
  providers: [
    ViewportComponent,
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    LocationPreviewComponent,
    ActionBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
