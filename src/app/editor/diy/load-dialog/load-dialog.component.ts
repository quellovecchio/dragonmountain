import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-load-dialog',
  templateUrl: './load-dialog.component.html',
  styleUrls: ['./load-dialog.component.scss'],
})
export class LoadDialogComponent implements OnInit {

  @ViewChild('stepper') private stepper!: MatStepper;

  selectedFile: any = undefined;
  isDataValid: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<LoadDialogComponent>
  ) {}

  ngOnInit(): void {
  }

  onSubmit(): void {
    const inputData = this.selectedFile;
    this.dialogRef.close(inputData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFileChange(event: any): void {
    this.isDataValid = false;
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
      this.stepper.next();
      this.startDataValidation();
    }
  }

  startDataValidation(): void {
    // fake wait, implement validation??
    setTimeout(() => {
      if(this.selectedFile)
      this.isDataValid = true;
    }, 1500);
  }

}
