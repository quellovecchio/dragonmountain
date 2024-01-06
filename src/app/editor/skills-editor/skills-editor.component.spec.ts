import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsEditorComponent } from './skills-editor.component';

describe('SkillsEditorComponent', () => {
  let component: SkillsEditorComponent;
  let fixture: ComponentFixture<SkillsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
