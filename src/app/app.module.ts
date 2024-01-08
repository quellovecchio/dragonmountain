import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import {MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoBoxComponent } from './game/info-box/info-box.component';
import { LocationPreviewComponent } from './game/location-preview/location-preview.component';
import { SceneComponent } from './game/scene/scene.component';
import { TextAreaComponent } from './game/text-area/text-area.component';
import { ViewportComponent } from './game/viewport/viewport.component';
import { LocationComponent } from './game/location/location.component';
import { FightComponent } from './game/fight/fight.component';
import { HttpClientModule } from '@angular/common/http';
import { ActionBarComponent } from './game/action-bar/action-bar.component';
import { ContextMenuComponent } from './game/context-menu/context-menu.component';
import { DataBarComponent } from './game/data-bar/data-bar.component';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { NgTiltModule } from '@geometricpanda/angular-tilt';
import { DiyComponent } from './editor/diy/diy.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GameComponent } from './game/game.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SkillsEditorComponent } from './editor/skills-editor/skills-editor.component';
import { ClassesEditorComponent } from './editor/classes-editor/classes-editor.component';
import { EnemiesEditorComponent } from './editor/enemies-editor/enemies-editor.component';
import { NpcsEditorComponent } from './editor/npcs-editor/npcs-editor.component';
import { LocationsEditorComponent } from './editor/locations-editor/locations-editor.component';
import { StagesEditorComponent } from './editor/stages-editor/stages-editor.component';
import { DialogItemEditorComponent } from './editor/item-editor/dialog-item-editor/dialog-item-editor.component';
import { ItemEditorComponent } from './editor/item-editor/item-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogSkillEditorComponent } from './editor/skills-editor/dialog-skill-editor/dialog-skill-editor.component';
import { DialogClassEditorComponent } from './editor/classes-editor/dialog-class-editor/dialog-class-editor.component';
import { DialogNpcEditorComponent } from './editor/npcs-editor/dialog-npc-editor/dialog-npc-editor.component';
import { DialogLocationEditorComponent } from './editor/locations-editor/dialog-location-editor/dialog-location-editor.component';
import { DialogStageEditorComponent } from './editor/stages-editor/dialog-stage-editor/dialog-stage-editor.component';


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
    ContextMenuComponent,
    DataBarComponent,
    DiyComponent,
    NotFoundComponent,
    GameComponent,
    SkillsEditorComponent,
    ClassesEditorComponent,
    EnemiesEditorComponent,
    NpcsEditorComponent,
    LocationsEditorComponent,
    StagesEditorComponent,
    DialogItemEditorComponent,
    ItemEditorComponent,
    DialogSkillEditorComponent,
    DialogClassEditorComponent,
    DialogNpcEditorComponent,
    DialogLocationEditorComponent,
    DialogStageEditorComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatCardModule,
    NgxTypedJsModule,
    NgTiltModule,
    MatSliderModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    MatDialogModule
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
