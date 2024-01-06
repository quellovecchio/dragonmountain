import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesEditorComponent } from './classes-editor.component';

describe('ClassesEditorComponent', () => {
  let component: ClassesEditorComponent;
  let fixture: ComponentFixture<ClassesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
