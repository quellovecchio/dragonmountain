import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Skill } from 'src/app/model/Skill';
import { DialogSkillEditorComponent } from './dialog-skill-editor/dialog-skill-editor.component';

@Component({
  selector: 'app-skills-editor',
  templateUrl: './skills-editor.component.html',
  styleUrls: ['./skills-editor.component.scss']
})
export class SkillsEditorComponent implements OnInit {

  savedSkills: Skill[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
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