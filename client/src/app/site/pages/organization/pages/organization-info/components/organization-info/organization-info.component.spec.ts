import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationInfoComponent } from './organization-info.component';

xdescribe(`OrganizationInfoComponent`, () => {
    let component: OrganizationInfoComponent;
    let fixture: ComponentFixture<OrganizationInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationInfoComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
