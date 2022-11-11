import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitForActionDialogComponent } from './wait-for-action-dialog.component';

xdescribe(`WaitForActionDialogComponent`, () => {
    let component: WaitForActionDialogComponent;
    let fixture: ComponentFixture<WaitForActionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitForActionDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WaitForActionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
