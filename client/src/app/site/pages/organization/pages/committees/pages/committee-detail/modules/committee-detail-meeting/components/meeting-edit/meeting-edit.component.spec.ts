import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingEditComponent } from './meeting-edit.component';

xdescribe(`MeetingEditComponent`, () => {
    let component: MeetingEditComponent;
    let fixture: ComponentFixture<MeetingEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingEditComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
