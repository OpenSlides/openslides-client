import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSettingsComponent } from './organization-settings.component';

xdescribe(`OrganizationSettingsComponent`, () => {
    let component: OrganizationSettingsComponent;
    let fixture: ComponentFixture<OrganizationSettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationSettingsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
