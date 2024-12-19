import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Class } from 'src/app/model/Actors/Class';
import { DialogClassEditorComponent } from './dialog-class-editor/dialog-class-editor.component';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-classes-editor',
  templateUrl: './classes-editor.component.html',
  styleUrls: ['./classes-editor.component.scss']
})
export class ClassesEditorComponent implements OnInit, AfterViewChecked {

  savedClasses: Class[] = [];

  constructor(private dialog: MatDialog, private editorService: EditorService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.editorService.getCurrentClasses() !== this.savedClasses) {
      this.savedClasses = this.editorService.getCurrentClasses();
      this.changeDetectorRef.detectChanges();
    }
  }

  save(): void {
    this.editorService.saveCurrentClasses(this.savedClasses);
  }

  addNewClass() { 
    this.savedClasses.push(new Class());
  }

  remove(index: number) {
    this.savedClasses.splice(index, 1);
    this.changeDetectorRef.detectChanges();
  }

  openClassEditorDialog(classParam: Class) {
    this.dialog.open(DialogClassEditorComponent, {
      height: '700px',
      width: '600px',
      data: classParam,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
