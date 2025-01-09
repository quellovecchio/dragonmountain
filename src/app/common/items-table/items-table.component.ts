import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/model/items/Item';

@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements OnInit {

  @Input() dataSource: MatTableDataSource<Item> = new MatTableDataSource();
  @Input() compact: boolean = false;
  @Output() clickEvent = new EventEmitter<Item>();
  displayedColumns = ['icon', 'details'];

  constructor() {
  }

  ngOnInit(): void {
    if(!this.compact)
      this.displayedColumns = ['icon', 'details'];
    else
      this.displayedColumns = ['details'];
  }

  public clickAction(item: Item): void {
    this.clickEvent.emit(item);
  }

}
