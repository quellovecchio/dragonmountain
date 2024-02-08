import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
  loadedRun = new Run();

  constructor(private dialog: MatDialog, private editorService: EditorService) { }

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

  openLoadDialog() {
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

  exportDb() {

  }

}
