import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Skill } from 'src/app/model/Skill';
import { DialogSkillEditorComponent } from './dialog-skill-editor/dialog-skill-editor.component';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-skills-editor',
  templateUrl: './skills-editor.component.html',
  styleUrls: ['./skills-editor.component.scss']
})
export class SkillsEditorComponent implements OnInit, AfterViewChecked {

  savedSkills: Skill[] = [];

  constructor(private dialog: MatDialog, private editorService: EditorService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.editorService.getCurrentSkills() !== this.savedSkills) {
      this.savedSkills = this.editorService.getCurrentSkills();
      this.changeDetectorRef.detectChanges();
    }
  }

  save(): void {
    this.editorService.saveCurrentSkills(this.savedSkills);
  }

  addNewItem() { 
    this.savedSkills.push(new Skill());
  }

  openSkillEditorDialog(skill: Skill) {
    this.dialog.open(DialogSkillEditorComponent, {
      height: '700px',
      width: '600px',
      data: skill,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}