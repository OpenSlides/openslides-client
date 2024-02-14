import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantSpeakerListComponent } from './participant-speaker-list.component';

xdescribe(`ParticipantSpeakerListComponent`, () => {
    let component: ParticipantSpeakerListComponent;
    let fixture: ComponentFixture<ParticipantSpeakerListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantSpeakerListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantSpeakerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
