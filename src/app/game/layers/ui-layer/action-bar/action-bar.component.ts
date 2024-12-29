import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Run } from '../../../../model/Run';
import { animate, style, transition, trigger } from '@angular/animations';
import { RunState } from '../../../../model/RunState';
import { Actor } from '../../../../model/Actors/Actor';
import { PlayingCharacter } from '../../../../model/Actors/PlayingCharacter';
import { Stats } from '../../../../model/Stats';
import { ItemService } from '../../../../services/item.service';
import { UiService } from '../ui.service';
import { Item } from '../../../../model/items/Item';
import { Character } from '../../../../model/Actors/Character';
import { RunService } from '../../../../services/run.service';
import { Skill } from '../../../../model/Skill';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';
import { MatTableDataSource } from '@angular/material/table';
import { run } from 'node:test';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {
  @Output() interactOnPartyActorSignal = new EventEmitter<{action: Item, actor: Actor}>();

  constructor(public itemService: ItemService, private uiService: UiService, public runService: RunService) { }

  ngOnInit(): void {
  }

}
