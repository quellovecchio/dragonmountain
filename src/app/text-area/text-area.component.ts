import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  textArea = new FormGroup({
    currentText: new FormControl('')
  });

  constructor() { }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.textArea.controls.currentText.setValue(text);
  }

}
