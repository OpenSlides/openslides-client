import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorFormFieldComponent } from './color-form-field.component';

xdescribe(`ColorFormFieldComponent`, () => {
    let component: ColorFormFieldComponent;
    let fixture: ComponentFixture<ColorFormFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ColorFormFieldComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorFormFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
