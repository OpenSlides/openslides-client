import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingCloneDialogComponent } from './meeting-clone-dialog.component';

xdescribe(`MeetingCloneDialogComponent`, () => {
    let component: MeetingCloneDialogComponent;
    let fixture: ComponentFixture<MeetingCloneDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MeetingCloneDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(MeetingCloneDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
