import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInputComponent } from './check-input.component';

xdescribe(`CheckInputComponent`, () => {
    let component: CheckInputComponent;
    let fixture: ComponentFixture<CheckInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CheckInputComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
