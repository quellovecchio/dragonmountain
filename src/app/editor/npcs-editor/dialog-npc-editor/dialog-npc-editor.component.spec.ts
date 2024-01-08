import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNpcEditorComponent } from './dialog-npc-editor.component';

describe('DialogNpcEditorComponent', () => {
  let component: DialogNpcEditorComponent;
  let fixture: ComponentFixture<DialogNpcEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNpcEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogNpcEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
