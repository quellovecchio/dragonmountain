import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemiesEditorComponent } from './enemies-editor.component';

describe('EnemiesEditorComponent', () => {
  let component: EnemiesEditorComponent;
  let fixture: ComponentFixture<EnemiesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnemiesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnemiesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
