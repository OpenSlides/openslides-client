import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationStatisticsComponent } from './organization-statistics.component';

xdescribe(`OrganizationStatisticsComponent`, () => {
    let component: OrganizationStatisticsComponent;
    let fixture: ComponentFixture<OrganizationStatisticsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganizationStatisticsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizationStatisticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
