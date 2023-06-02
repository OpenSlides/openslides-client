import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaterangepickerComponent } from './daterangepicker.component';

xdescribe(`DaterangepickerComponent`, () => {
    let component: DaterangepickerComponent;
    let fixture: ComponentFixture<DaterangepickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DaterangepickerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(DaterangepickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
