import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingTimeComponent } from './meeting-time.component';

xdescribe(`MeetingTimeComponent`, () => {
    let component: MeetingTimeComponent;
    let fixture: ComponentFixture<MeetingTimeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingTimeComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
