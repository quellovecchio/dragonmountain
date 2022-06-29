import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table'
import { MatMenuModule} from '@angular/material/menu';  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { LocationPreviewComponent } from './location-preview/location-preview.component';
import { SceneComponent } from './scene/scene.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { ViewportComponent } from './viewport/viewport.component';
import { LocationComponent } from './location/location.component';

@NgModule({
  declarations: [
    AppComponent,
    InfoBoxComponent,
    SceneComponent,
    TextAreaComponent,
    ViewportComponent,
    LocationPreviewComponent,
    LocationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatMenuModule,
    BrowserAnimationsModule
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
    LocationPreviewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
