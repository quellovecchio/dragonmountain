import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Run } from '../model/Run';
import { animate, style, transition, trigger } from '@angular/animations';
import { RunState } from '../model/RunState';
import { Actor } from '../model/Actors/Actor';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Stats } from '../model/Stats';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, width: 0, top: 0 }),
            animate('0.2s ease-out',
              style({ height: 500, width: 200, top: 100 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 500, width: 200, top: 100 }),
            animate('0.2s ease-in',
              style({ height: 0, width: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ActionBarComponent implements OnInit {

  @Input() run: Run = new Run();
  @Output() onItemSelect = new EventEmitter<any>();
  @Output() refreshLocationsSignal = new EventEmitter<any>();
  @Output() moveToBossfightSignal = new EventEmitter<any>();
  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;
  public actorMenuOpened: boolean = false;
  public displayedActorMenu: PlayingCharacter = new PlayingCharacter();

  constructor() { }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  toggleInventory() {
    this.onItemSelect.emit(undefined);
    this.inventoryDisabled = true;
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  toggleActorInfo(actor: PlayingCharacter) {
    this.actorMenuOpened = !this.actorMenuOpened;
    this.displayedActorMenu = actor;
  }

  selectItem(item: any) {
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
    console.log(item.name + " selected")
    this.onItemSelect.emit(item);
  }

  refreshLocations() {
    this.refreshLocationsSignal.emit();
  }

  moveToBossfightLocation() {
    this.moveToBossfightSignal.emit();
  }

  isExploreEnabled() {
    return (this.run.state == RunState.Exploration && this.run.experience > 0);
  }

  isMoveToBossfightEnabled() {
    return (this.run.state == RunState.Exploration && (this.run.experience >= (4 * this.run.level) || !this.run.stage.bossfightLocked));
  }

  getStatsToDisplay(stats: Stats) {
    return [
      { name: "strength", value: stats.strength },
      { name: "dexterity", value: stats.dexterity },
      { name: "constitution", value: stats.constitution },
      { name: "intelligence", value: stats.intelligence },
      { name: "wisdom", value: stats.wisdom },
      { name: "charisma", value: stats.charisma },
    ]
  }
}
