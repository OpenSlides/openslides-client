import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingInfoComponent } from './meeting-info.component';

xdescribe(`MeetingInfoComponent`, () => {
    let component: MeetingInfoComponent;
    let fixture: ComponentFixture<MeetingInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingInfoComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
