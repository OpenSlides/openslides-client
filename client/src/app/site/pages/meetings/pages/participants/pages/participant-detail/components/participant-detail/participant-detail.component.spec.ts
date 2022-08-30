import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantDetailComponent } from './participant-detail.component';

xdescribe(`ParticipantDetailComponent`, () => {
    let component: ParticipantDetailComponent;
    let fixture: ComponentFixture<ParticipantDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
