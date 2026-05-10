import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Location } from "../../model/Location";
import { animate, style, transition, trigger } from '@angular/animations';
import { take } from 'rxjs';
import { RunService } from 'src/app/services/run.service';
import { MusicService } from 'src/app/services/music.service';

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
              style({ transform: 'rotateY(1800deg)' }))
          ]
        ),
      ]
    )
  ]
})
export class LocationPreviewComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // check if the click is inside the box
    if (this.eRef.nativeElement.contains(event.target)) {
      this.contextMenuPosition.x = event.y;
      this.contextMenuPosition.y = event.x;
      this.openMenu();
    }
  }

  contextMenuPosition = { x: 0, y: 0 };

  locationData?: Location;
  @Input() location!: any;

  animateLocation: boolean = false;

  constructor(private readonly viewRef: ViewContainerRef, private eRef: ElementRef, private runService: RunService, private musicService: MusicService) { }

  ngOnInit(): void {
    this.locationData = this.location;
    this.musicService.playSound('spinning-locations');
    let spins = 5;
    var i = setInterval(() => {
      if (spins === 0) {
        clearInterval(i);
      }
      spins--;
      this.musicService.playSound('spinning-locations');
    }, 200);
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

  moveTo() {
    this.musicService.playSound('room-in');
    this.runService.moveTo(this.location);
  }

  reloadLocations() {
    // animation
    this.animateLocation = true;
    setTimeout(() => { this.animateLocation = false; }, 400);
    // TODO real logic
  }

  readonly effect = 'cosmos-middle-trans';

  get rarityColor(): string {
    const map: Record<string, string> = {
      common: '#9a9a9a', uncommon: '#22c55e', rare: '#4c7b94',
      epic: '#9b59b6', legendary: '#F1C66A'
    };
    return map[this.locationData?.rarity ?? 'common'] ?? '#9a9a9a';
  }

}
