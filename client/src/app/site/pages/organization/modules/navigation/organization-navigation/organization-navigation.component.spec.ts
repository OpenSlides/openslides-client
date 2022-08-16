import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationNavigationComponent } from './organization-navigation.component';

xdescribe(`OrganizationNavigationComponent`, () => {
    let component: OrganizationNavigationComponent;
    let fixture: ComponentFixture<OrganizationNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationNavigationComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
