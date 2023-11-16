import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Location } from "../model/Location";
import { animate, style, transition, trigger } from '@angular/animations';
import { MatCard } from '@angular/material/card';
import { take } from 'rxjs';

@Component({
  selector: 'app-location-preview',
  templateUrl: './location-preview.component.html',
  styleUrls: ['./location-preview.component.scss'],
  animations: [
    trigger(
      'reloadLocations', 
      [
        transition(
          ':enter', 
          [
            animate('2s ease', 
            style({ transform:  'rotateY(1800deg)' }))
          ]
        )
      ]
    )
  ]
})
export class LocationPreviewComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // check if the click is inside the box
    if(this.eRef.nativeElement.contains(event.target)) {
      this.contextMenuPosition.x = event.y;
      this.contextMenuPosition.y = event.x;
      this.openMenu();
    }
  }

  contextMenuPosition = {x: 0, y: 0};

  @Input() locationData!: Location;
  @Output() exploreSignal = new EventEmitter<string>();

  animateLocation: boolean = false;

  constructor(private readonly viewRef: ViewContainerRef, private eRef: ElementRef) { }

  ngOnInit(): void {
  }

  openMenu() {
    this.menuTrigger?.menuOpened.pipe(take(1)).subscribe(() => {
      const menu = document.getElementsByClassName('location-menu')[0] as HTMLElement;
      menu.focus();
      menu.style.position = 'absolute';
      menu.style.top = `${this.contextMenuPosition.x}px`;
      menu.style.left = `${this.contextMenuPosition.y}px`;
    });

    this.menuTrigger?.openMenu();
  }

  explore() {
    this.exploreSignal.emit("The party moved to " + this.locationData.name + ".");
  }

  reloadLocations(){
    // animation
    this.animateLocation = true;
    setTimeout(() => {this.animateLocation = false;}, 400);
    // TODO real logic
  }

}
