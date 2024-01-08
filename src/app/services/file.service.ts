import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  imagesFiles: string[] = [
    "assets/images/items/item1.png",
    "assets/images/items/item2.png",
    "assets/images/items/item3.png",
    "assets/images/items/item4.png",
  ];

  constructor() { }

  getAllImagesFilePaths(): string[] {
    return this.imagesFiles;
  }

}
