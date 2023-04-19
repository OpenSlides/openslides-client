import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingListComponent } from './meeting-list.component';

xdescribe(`MeetingListComponent`, () => {
    let component: MeetingListComponent;
    let fixture: ComponentFixture<MeetingListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingListComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(MeetingListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
