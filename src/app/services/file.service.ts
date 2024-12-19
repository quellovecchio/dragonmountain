import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  itemsImagesFiles: string[] = [
    "assets/images/items/item1.png",
    "assets/images/items/item2.png",
    "assets/images/items/item3.png",
    "assets/images/items/item4.png",
  ];

  locationsImagesFiles: string[] = [
    "assets/images/locations/location1-bg.png",
    "assets/images/locations/location2-bg.png",
    "assets/images/locations/location3-bg.png",
    "assets/images/locations/location4-bg.png",
  ];

  actorsImagesFiles: string[] = [
    "assets/images/actors/actor1.png",
    "assets/images/actors/actor2.png",
    "assets/images/actors/actor3.png",
    "assets/images/actors/actor4.png",
    "assets/images/actors/enemy1.png",
    "assets/images/actors/enemy2.png",
  ];

  constructor() { }

  getAllItemsImagesFilePaths(): string[] {
    return this.itemsImagesFiles;
  }

  getAllLocationsImagesFilePaths(): string[] {
    return this.locationsImagesFiles;
  }

  getAllActorsFilePaths(): string[] {
    return this.actorsImagesFiles;
  }

}
