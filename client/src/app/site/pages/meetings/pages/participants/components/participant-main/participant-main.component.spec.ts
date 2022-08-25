import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantMainComponent } from './participant-main.component';

xdescribe(`ParticipantMainComponent`, () => {
    let component: ParticipantMainComponent;
    let fixture: ComponentFixture<ParticipantMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
