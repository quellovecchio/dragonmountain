import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLayerComponent } from './ui-layer.component';

describe('UiLayerComponent', () => {
  let component: UiLayerComponent;
  let fixture: ComponentFixture<UiLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UiLayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
