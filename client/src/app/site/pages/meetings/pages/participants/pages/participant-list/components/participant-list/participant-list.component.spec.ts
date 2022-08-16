import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantListComponent } from './participant-list.component';

xdescribe(`ParticipantListComponent`, () => {
    let component: ParticipantListComponent;
    let fixture: ComponentFixture<ParticipantListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
