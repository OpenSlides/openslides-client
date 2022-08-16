import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleOptionChartTableComponent } from './single-option-chart-table.component';

xdescribe(`SingleOptionChartTableComponent`, () => {
    let component: SingleOptionChartTableComponent;
    let fixture: ComponentFixture<SingleOptionChartTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SingleOptionChartTableComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleOptionChartTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
