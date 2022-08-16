import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTagMainComponent } from './organization-tag-main.component';

xdescribe(`OrganizationTagMainComponent`, () => {
    let component: OrganizationTagMainComponent;
    let fixture: ComponentFixture<OrganizationTagMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationTagMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationTagMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
