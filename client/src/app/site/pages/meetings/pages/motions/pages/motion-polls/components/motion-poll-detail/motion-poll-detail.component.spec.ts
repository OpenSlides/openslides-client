import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollDetailComponent } from './motion-poll-detail.component';

xdescribe(`MotionPollDetailComponent`, () => {
    let component: MotionPollDetailComponent;
    let fixture: ComponentFixture<MotionPollDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
