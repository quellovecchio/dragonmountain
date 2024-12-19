import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NpcsEditorComponent } from './npcs-editor.component';

describe('NpcsEditorComponent', () => {
  let component: NpcsEditorComponent;
  let fixture: ComponentFixture<NpcsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NpcsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NpcsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
