import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogStageEditorComponent } from './dialog-stage-editor.component';

describe('DialogStageEditorComponent', () => {
  let component: DialogStageEditorComponent;
  let fixture: ComponentFixture<DialogStageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogStageEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogStageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
