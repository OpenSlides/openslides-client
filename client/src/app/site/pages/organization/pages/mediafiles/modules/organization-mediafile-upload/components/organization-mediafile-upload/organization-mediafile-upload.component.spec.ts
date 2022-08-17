import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMediafileUploadComponent } from './organization-mediafile-upload.component';

describe('OrganizationMediafileUploadComponent', () => {
  let component: OrganizationMediafileUploadComponent;
  let fixture: ComponentFixture<OrganizationMediafileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationMediafileUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationMediafileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
