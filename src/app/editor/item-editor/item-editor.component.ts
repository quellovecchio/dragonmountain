import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/model/items/Item';

@Component({
  selector: 'app-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {

  savedItems: Item[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  addNewItem() { 
    this.savedItems.push(new Item());
  }

}
