import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingPreviewComponent } from './meeting-preview.component';

describe('MeetingPreviewComponent', () => {
    let component: MeetingPreviewComponent;
    let fixture: ComponentFixture<MeetingPreviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingPreviewComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
