import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSkillEditorComponent } from './dialog-skill-editor.component';

describe('DialogSkillEditorComponent', () => {
  let component: DialogSkillEditorComponent;
  let fixture: ComponentFixture<DialogSkillEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogSkillEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSkillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
