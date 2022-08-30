import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTagListComponent } from './organization-tag-list.component';

xdescribe(`OrganizationTagListComponent`, () => {
    let component: OrganizationTagListComponent;
    let fixture: ComponentFixture<OrganizationTagListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationTagListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationTagListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
