import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Run } from '../../model/Run';
import { NpcsEditorComponent } from '../npcs-editor/npcs-editor.component';
import { LoadDialogComponent } from './load-dialog/load-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { EditorService } from 'src/app/services/editor.service';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import { SkillsEditorComponent } from '../skills-editor/skills-editor.component';
import { LocationsEditorComponent } from '../locations-editor/locations-editor.component';
import { ClassesEditorComponent } from '../classes-editor/classes-editor.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Stats } from 'src/app/model/Stats';

// TODO sort of a fast way to do it must be loaded from chosen character
export const STARTING_STATS: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 20,
  intelligence: 20,
  wisdom: 10,
  charisma: 10,
  healthPoints: 20,
  skillPoints: 20
}

@Component({
  selector: 'app-diy',
  templateUrl: './diy.component.html',
  styleUrls: ['./diy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiyComponent implements OnInit {

  @ViewChild('npcEditor') npcEditor!: NpcsEditorComponent;
  @ViewChild('itemEditor') itemEditor!: ItemEditorComponent;
  @ViewChild('skillsEditor') skillsEditor!: SkillsEditorComponent;
  @ViewChild('classesEditor') classesEditor!: ClassesEditorComponent;
  @ViewChild('locationEditor') locationsEditor!: LocationsEditorComponent;
  loadedRun = new Run(new PlayingCharacter(STARTING_STATS));

  constructor(
    private dialog: MatDialog,
    private editorService: EditorService) { }

  ngOnInit(): void {
  }

  onTabChanged(): void {
    console.log('saving...');
    if(this.npcEditor)
    this.npcEditor.save();
    if(this.itemEditor)
    this.itemEditor.save();
    if(this.skillsEditor)
    this.skillsEditor.save();
    if(this.classesEditor)
    this.classesEditor.save();
    if(this.locationsEditor)
    this.locationsEditor.save();
  }

  loadDatabaseFile(result: File) {
    const fileReader = new FileReader();
    fileReader.readAsText(result, "UTF-8");
    fileReader.onload = () => {
      var data = JSON.parse(fileReader.result as string);
      this.editorService.reset();
      this.editorService.loadFromFile(data);
    }
    fileReader.onerror = (error) => {
      // TODO handle the error properly
      console.log(error);
    }
  }

  loadClicked() {
    this.openDialog().subscribe((result) => {
      if (result) {
        this.loadDatabaseFile(result);
      }
    });
  }

  openDialog(): Observable<any> {
    const dialogRef = this.dialog.open(LoadDialogComponent, {
      height: '475px',
      width: '400px',
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    });

    return dialogRef.afterClosed();
  }

  exportClicked() {
    // Your data to be included in the JSON file
    const jsonData = this.generateExportJsonData();

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const download = document.createElement("a");
    download.style.display = "none";
    
    const fileURL = URL.createObjectURL(blob);
    download.href = fileURL;
    download.download = 'data.json';
    download.click();
  }

  generateExportJsonData() {
    return {
      skills : this.editorService.getCurrentSkills(),
      classes : this.editorService.getCurrentClasses(),
      items : this.editorService.getCurrentItems(),
      actors : this.editorService.exportActors(),
      locations : this.editorService.exportLocations(),
      stages : this.editorService.exportStages(),
    }
  }

}
