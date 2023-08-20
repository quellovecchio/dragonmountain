import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Run } from '../model/Run';
import { animate, style, transition, trigger } from '@angular/animations';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/Item';

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
                    style({ height: 500, width: 1000, top: -500 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 500, width: 1000, top: -500 }),
            animate('0.2s ease-in', 
                    style({ height: 0, width: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ActionBarComponent implements OnInit {

  /*private itemMenuActions: Map<string, (actor: Actor) => {}> = new Map([
    ["give", giveItemTo()]
  ]);*/
  
  @Input() run: Run = new Run();
  @Output() onItemSelect = new EventEmitter<any>();
  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  toggleInventory() {
    this.inventoryDisabled = true;
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => {this.inventoryDisabled = false;}, 400);
  }

  selectItem(item: any) {
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => {this.inventoryDisabled = false;}, 400);
    console.log(item.name + " selected")
    this.onItemSelect.emit(item);
  }

  joinsParty(newcomer: any) {
    const newRun = this.run;
    const newArray = [...newRun.party];
    newArray.push(newcomer);
    // TODO handle party joins when party is full
    newRun.party = newArray;
    this.run = newRun;
  }
}
