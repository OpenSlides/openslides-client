import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSpinnerComponent } from './global-spinner.component';

xdescribe(`GlobalSpinnerComponent`, () => {
    let component: GlobalSpinnerComponent;
    let fixture: ComponentFixture<GlobalSpinnerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GlobalSpinnerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(GlobalSpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
