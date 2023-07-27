import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Run } from '../model/Run';
import { animate, style, transition, trigger } from '@angular/animations';

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
  
  @Input() run: Run = new Run();
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
    setTimeout(() => {this.inventoryDisabled = false;}, 1000);
  }
}
