import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBarComponent } from './data-bar.component';

describe('DataBarComponent', () => {
  let component: DataBarComponent;
  let fixture: ComponentFixture<DataBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
