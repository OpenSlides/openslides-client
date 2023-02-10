import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoppedWaitingForActionDialogComponent } from './stopped-waiting-for-action-dialog.component';

xdescribe(`StoppedWaitingForActionDialogComponent`, () => {
    let component: StoppedWaitingForActionDialogComponent;
    let fixture: ComponentFixture<StoppedWaitingForActionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoppedWaitingForActionDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StoppedWaitingForActionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
