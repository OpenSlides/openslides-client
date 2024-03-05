import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantSwitchDialogComponent } from './participant-switch-dialog.component';

xdescribe(`ParticipantSwitchDialogComponent`, () => {
    let component: ParticipantSwitchDialogComponent;
    let fixture: ComponentFixture<ParticipantSwitchDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantSwitchDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantSwitchDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
