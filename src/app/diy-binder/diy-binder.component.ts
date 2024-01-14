import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-diy-binder',
  templateUrl: './diy-binder.component.html',
  styleUrls: ['./diy-binder.component.scss']
})
export class DiyBinderComponent implements OnInit {

  @Input() list: any[] = [];
  @Input() selection: any;
  @Output() selectionChange = new EventEmitter<any>();

  searchTerm: string = '';
  filteredItems: any[] = [];

  ngOnInit(): void {
    
  }

  filterItems() {
    this.filteredItems = this.list.filter(item =>
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectItem(item: any) {
    this.selection = item;
    this.selectionChange.emit(this.selection);
    this.searchTerm = this.selection.name; // Clear the search term after selection
    this.filteredItems = []; // Clear the autocomplete list
  }

}
