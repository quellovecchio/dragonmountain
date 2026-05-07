import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-data-bar',
  templateUrl: './data-bar.component.html',
  styleUrls: ['./data-bar.component.scss']
})
export class DataBarComponent implements OnInit {

  @Input() currentValue: number = 0;
  @Input() minimized: boolean = false;
  oldValue: number = 0;
  @Input() maxValue: number = 0;
  // 1 -> hp, 2 -> mp
  @Input() barType: number = 0;

  barWidth: number = 100;
  hitWidth: number = 0;

  ngOnInit(): void {
    this.oldValue = this.currentValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentValue'] && changes['currentValue'].previousValue !== undefined && (changes['currentValue'].currentValue !== changes['currentValue'].previousValue)) {
      this.damage(changes['currentValue'].previousValue - changes['currentValue'].currentValue);
    }
  }

  constructor() {
    // TODO make code to register the data bar to the actor in the fightmanager so that it can be called when attack is processed
  }

  damage(damage: number) {
    const barWidth = (this.currentValue / this.maxValue) * 100;
    const hitWidth = (damage / (this.currentValue + damage)) * 100;

    this.hitWidth = hitWidth;

    setTimeout(() => {
      this.hitWidth = 0;
      this.barWidth = barWidth;
    }, 500);
  }

}
