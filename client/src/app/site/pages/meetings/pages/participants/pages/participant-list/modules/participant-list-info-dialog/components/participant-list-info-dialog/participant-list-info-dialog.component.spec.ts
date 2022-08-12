import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantListInfoDialogComponent } from './participant-list-info-dialog.component';

xdescribe(`ParticipantListInfoDialogComponent`, () => {
    let component: ParticipantListInfoDialogComponent;
    let fixture: ComponentFixture<ParticipantListInfoDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantListInfoDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantListInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
