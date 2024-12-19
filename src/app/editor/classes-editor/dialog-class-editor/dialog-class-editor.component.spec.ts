import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogClassEditorComponent } from './dialog-class-editor.component';

describe('DialogClassEditorComponent', () => {
  let component: DialogClassEditorComponent;
  let fixture: ComponentFixture<DialogClassEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogClassEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogClassEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
