import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointOfOrderDialogComponent } from './point-of-order-dialog.component';

xdescribe(`PointOfOrderDialogComponent`, () => {
    let component: PointOfOrderDialogComponent;
    let fixture: ComponentFixture<PointOfOrderDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PointOfOrderDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PointOfOrderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
