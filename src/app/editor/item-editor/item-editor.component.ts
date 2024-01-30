import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/model/items/Item';
import { DialogItemEditorComponent } from './dialog-item-editor/dialog-item-editor.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {

  savedItems: Item[] = [];

  constructor(private dialog: MatDialog, private editorService: EditorService) { }

  ngOnInit(): void {
  }

  save(): void {
    this.editorService.saveCurrentItems(this.savedItems);
  }

  addNewItem() { 
    this.savedItems.push(new Item());
  }

  openItemEditorDialog(item: Item) {
    this.dialog.open(DialogItemEditorComponent, {
      height: '700px',
      width: '600px',
      data: item,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
