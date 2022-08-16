import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollComponent } from './motion-poll.component';

xdescribe(`MotionPollComponent`, () => {
    let component: MotionPollComponent;
    let fixture: ComponentFixture<MotionPollComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
