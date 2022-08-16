import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantPresenceComponent } from './participant-presence.component';

xdescribe(`ParticipantPresenceComponent`, () => {
    let component: ParticipantPresenceComponent;
    let fixture: ComponentFixture<ParticipantPresenceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantPresenceComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantPresenceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
