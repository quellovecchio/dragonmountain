import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  @Input() actions: Map<string, () => {}> = new Map<string, () => {}>();

  constructor() { }

  ngOnInit(): void {
  }

}
