import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Class } from 'src/app/model/Actors/Class';
import { Skill } from 'src/app/model/Skill';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-dialog-class-editor',
  templateUrl: './dialog-class-editor.component.html',
  styleUrls: ['./dialog-class-editor.component.scss']
})
export class DialogClassEditorComponent implements OnInit {

  stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  classParam: Class;

  currentSkills: Skill[] = [];
  selectedSkill?: Skill = undefined;

  skillEntry: { skillId?: number, unlockLevel?: number, unlockStat?: string } = { skillId: undefined, unlockLevel: undefined, unlockStat: undefined };

  constructor(@Inject(MAT_DIALOG_DATA) public data: Class, private editorService: EditorService) {
    this.currentSkills = this.editorService.getCurrentSkills();
    this.classParam = data;
  }

  ngOnInit(): void {
  }

  getSkillNameById(id: number): string {
    return this.editorService.getSkillById(id).name;
  }

  addSkillEntry(): void {
      this.classParam.skillTree.push({ skillId: this.selectedSkill!.id, unlockLevel: this.skillEntry.unlockLevel!, unlockStat: this.skillEntry.unlockStat! });
      this.selectedSkill = undefined;
      this.skillEntry = { skillId: undefined, unlockLevel: undefined, unlockStat: undefined };
  }

  removeSkillEntry(index: number): void {
      this.classParam.skillTree.splice(index, 1);
      // Trigger change detection
      this.classParam.skillTree = [...this.classParam.skillTree];
  }

}
