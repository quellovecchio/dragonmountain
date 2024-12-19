import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogItemEditorComponent } from './dialog-item-editor.component';

describe('DialogItemEditorComponent', () => {
  let component: DialogItemEditorComponent;
  let fixture: ComponentFixture<DialogItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogItemEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
