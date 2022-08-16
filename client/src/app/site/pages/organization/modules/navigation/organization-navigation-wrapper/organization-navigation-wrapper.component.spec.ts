import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationNavigationWrapperComponent } from './organization-navigation-wrapper.component';

xdescribe(`OrganizationNavigationWrapperComponent`, () => {
    let component: OrganizationNavigationWrapperComponent;
    let fixture: ComponentFixture<OrganizationNavigationWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationNavigationWrapperComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationNavigationWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
