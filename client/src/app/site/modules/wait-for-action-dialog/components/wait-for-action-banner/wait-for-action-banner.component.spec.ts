import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitForActionBannerComponent } from './wait-for-action-banner.component';

describe('WaitForActionBannerComponent', () => {
  let component: WaitForActionBannerComponent;
  let fixture: ComponentFixture<WaitForActionBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitForActionBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitForActionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
