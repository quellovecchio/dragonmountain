import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Run } from '../../model/Run';
import { NpcsEditorComponent } from '../npcs-editor/npcs-editor.component';

@Component({
  selector: 'app-diy',
  templateUrl: './diy.component.html',
  styleUrls: ['./diy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiyComponent implements OnInit {

  @ViewChild('npcEditor') npcEditor!: NpcsEditorComponent;
  @ViewChild('itemEditor') itemEditor!: NpcsEditorComponent;
  @ViewChild('skillsEditor') skillsEditor!: NpcsEditorComponent;
  loadedRun = new Run();

  constructor() { }

  ngOnInit(): void {
  }

  onTabChanged($event: any): void{
    console.log('saving...');
    this.npcEditor.save();
    this.itemEditor.save();
    this.skillsEditor.save();
  }

  loadDb() {

  }

  exportDb() {
    
  }

}
