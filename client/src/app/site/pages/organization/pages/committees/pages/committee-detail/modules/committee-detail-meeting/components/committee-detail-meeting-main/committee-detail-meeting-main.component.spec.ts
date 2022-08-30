import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDetailMeetingMainComponent } from './committee-detail-meeting-main.component';

xdescribe(`CommitteeDetailMeetingMainComponent`, () => {
    let component: CommitteeDetailMeetingMainComponent;
    let fixture: ComponentFixture<CommitteeDetailMeetingMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeDetailMeetingMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeDetailMeetingMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
