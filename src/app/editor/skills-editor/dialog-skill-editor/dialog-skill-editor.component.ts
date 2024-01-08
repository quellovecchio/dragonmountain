import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Skill } from 'src/app/model/Skill';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-skill-editor',
  templateUrl: './dialog-skill-editor.component.html',
  styleUrls: ['./dialog-skill-editor.component.scss']
})
export class DialogSkillEditorComponent implements OnInit {

  skill: Skill;
  isEquip = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Skill, private fileService: FileService) {
    this.skill = data;
  }

  ngOnInit(): void {
  }

}
