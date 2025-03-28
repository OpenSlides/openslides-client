import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantDetailEditComponent } from './participant-detail-edit.component';

xdescribe(`ParticipantDetailEditComponent`, () => {
    let component: ParticipantDetailEditComponent;
    let fixture: ComponentFixture<ParticipantDetailEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantDetailEditComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantDetailEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
