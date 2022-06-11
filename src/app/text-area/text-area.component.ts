import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  currentText: string;

  constructor(currentText: string) { 
    this.currentText = currentText;
  }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.currentText = text;
  }

}
