import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMediafileMainComponent } from './organization-mediafile-main.component';

describe('OrganizationMediafileMainComponent', () => {
  let component: OrganizationMediafileMainComponent;
  let fixture: ComponentFixture<OrganizationMediafileMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationMediafileMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationMediafileMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
