import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollDetailContentComponent } from './motion-poll-detail-content.component';

xdescribe(`MotionPollDetailContentComponent`, () => {
    let component: MotionPollDetailContentComponent;
    let fixture: ComponentFixture<MotionPollDetailContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollDetailContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollDetailContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
