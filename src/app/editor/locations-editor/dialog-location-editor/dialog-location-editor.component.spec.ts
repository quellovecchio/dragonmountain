import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLocationEditorComponent } from './dialog-location-editor.component';

describe('DialogLocationEditorComponent', () => {
  let component: DialogLocationEditorComponent;
  let fixture: ComponentFixture<DialogLocationEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogLocationEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogLocationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
