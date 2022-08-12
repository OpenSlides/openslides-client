import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingImportComponent } from './meeting-import.component';

xdescribe(`MeetingImportComponent`, () => {
    let component: MeetingImportComponent;
    let fixture: ComponentFixture<MeetingImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingImportComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
