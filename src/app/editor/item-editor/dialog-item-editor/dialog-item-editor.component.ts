import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EffectType } from 'src/app/model/Interaction';
import { Item } from 'src/app/model/items/Item';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-item-editor',
  templateUrl: './dialog-item-editor.component.html',
  styleUrls: ['./dialog-item-editor.component.scss']
})
export class DialogItemEditorComponent implements OnInit {

  effectTypes = Object.keys(EffectType).filter(value => Number.isNaN(parseInt(value)));
  images = this.fileService.getAllItemsImagesFilePaths();

  item: Item;
  isEquip = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Item, private fileService: FileService) {
    this.item = data;
  }

  ngOnInit(): void {
  }
}
