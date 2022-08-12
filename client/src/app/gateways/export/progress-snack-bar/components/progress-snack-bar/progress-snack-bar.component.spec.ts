import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressSnackBarComponent } from './progress-snack-bar.component';

xdescribe(`ProgressSnackBarComponent`, () => {
    let component: ProgressSnackBarComponent;
    let fixture: ComponentFixture<ProgressSnackBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProgressSnackBarComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProgressSnackBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
