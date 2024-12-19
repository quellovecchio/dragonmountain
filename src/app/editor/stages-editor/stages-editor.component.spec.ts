import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagesEditorComponent } from './stages-editor.component';

describe('StagesEditorComponent', () => {
  let component: StagesEditorComponent;
  let fixture: ComponentFixture<StagesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StagesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
