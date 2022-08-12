import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMainComponent } from './dashboard-main.component';

xdescribe(`DashboardMainComponent`, () => {
    let component: DashboardMainComponent;
    let fixture: ComponentFixture<DashboardMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DashboardMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
