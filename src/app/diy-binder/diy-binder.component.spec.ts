import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiyBinderComponent } from './diy-binder.component';

describe('DiyBinderComponent', () => {
  let component: DiyBinderComponent;
  let fixture: ComponentFixture<DiyBinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiyBinderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiyBinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
