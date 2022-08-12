import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundedInputComponent } from './rounded-input.component';

xdescribe(`RoundedInputComponent`, () => {
    let component: RoundedInputComponent;
    let fixture: ComponentFixture<RoundedInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RoundedInputComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RoundedInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
