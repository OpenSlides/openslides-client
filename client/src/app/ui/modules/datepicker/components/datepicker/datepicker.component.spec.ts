import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerComponent } from './datepicker.component';

xdescribe(`DatepickerComponent`, () => {
    let component: DatepickerComponent;
    let fixture: ComponentFixture<DatepickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DatepickerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(DatepickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
