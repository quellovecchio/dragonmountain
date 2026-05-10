import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table'
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocationPreviewComponent } from './game/location-preview/location-preview.component';
import { SceneComponent } from './game/scene/scene.component';
import { LocationComponent } from './game/location/location.component';
import { FightComponent } from './game/fight/fight.component';
import { HttpClientModule } from '@angular/common/http';
import { DataBarComponent } from './game/data-bar/data-bar.component';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { NgTiltModule } from '@geometricpanda/angular-tilt';
import { DiyComponent } from './editor/diy/diy.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GameComponent } from './game/game.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SkillsEditorComponent } from './editor/skills-editor/skills-editor.component';
import { ClassesEditorComponent } from './editor/classes-editor/classes-editor.component';
import { NpcsEditorComponent } from './editor/npcs-editor/npcs-editor.component';
import { LocationsEditorComponent } from './editor/locations-editor/locations-editor.component';
import { StagesEditorComponent } from './editor/stages-editor/stages-editor.component';
import { DialogItemEditorComponent } from './editor/item-editor/dialog-item-editor/dialog-item-editor.component';
import { ItemEditorComponent } from './editor/item-editor/item-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DialogSkillEditorComponent } from './editor/skills-editor/dialog-skill-editor/dialog-skill-editor.component';
import { DialogClassEditorComponent } from './editor/classes-editor/dialog-class-editor/dialog-class-editor.component';
import { DialogNpcEditorComponent } from './editor/npcs-editor/dialog-npc-editor/dialog-npc-editor.component';
import { DialogLocationEditorComponent } from './editor/locations-editor/dialog-location-editor/dialog-location-editor.component';
import { DialogStageEditorComponent } from './editor/stages-editor/dialog-stage-editor/dialog-stage-editor.component';
import { DiyBinderComponent } from './diy-binder/diy-binder.component';
import { LoadDialogComponent } from './editor/diy/load-dialog/load-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ItemsTableComponent } from './common/items-table/items-table.component';
import { ActionBarComponent } from './game/ui-layer/action-bar/action-bar.component';
import { TextAreaComponent } from './game/ui-layer/text-area/text-area.component';
import { UiLayerComponent } from './game/ui-layer/ui-layer.component';
import { InfoBoxComponent } from './game/ui-layer/info-box/info-box.component';
import { ParallaxLayerDirective } from './directives/parallax-layer.directive';
@NgModule({
  declarations: [
    AppComponent,
    InfoBoxComponent,
    ParallaxLayerDirective,
    SceneComponent,
    TextAreaComponent,
    LocationPreviewComponent,
    LocationComponent,
    FightComponent,
    ActionBarComponent,
    DataBarComponent,
    DiyComponent,
    NotFoundComponent,
    GameComponent,
    SkillsEditorComponent,
    ClassesEditorComponent,
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
    DiyBinderComponent,
    LoadDialogComponent,
    ItemsTableComponent,
    UiLayerComponent,
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
    MatSlideToggleModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatProgressSpinnerModule
  ],
  exports: [
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    LocationPreviewComponent,
  ],
  providers: [
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    LocationPreviewComponent,
    ActionBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
