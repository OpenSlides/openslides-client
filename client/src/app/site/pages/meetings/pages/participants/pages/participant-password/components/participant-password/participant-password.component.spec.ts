import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantPasswordComponent } from './participant-password.component';

xdescribe(`ParticipantPasswordComponent`, () => {
    let component: ParticipantPasswordComponent;
    let fixture: ComponentFixture<ParticipantPasswordComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantPasswordComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
