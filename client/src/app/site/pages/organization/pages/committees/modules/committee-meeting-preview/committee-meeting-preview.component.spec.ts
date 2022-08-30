import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeMeetingPreviewComponent } from './committee-meeting-preview.component';

xdescribe(`CommitteeMeetingPreviewComponent`, () => {
    let component: CommitteeMeetingPreviewComponent;
    let fixture: ComponentFixture<CommitteeMeetingPreviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeMeetingPreviewComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeMeetingPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
