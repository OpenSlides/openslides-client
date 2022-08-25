import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollFormComponent } from './motion-poll-form.component';

xdescribe(`MotionPollFormComponent`, () => {
    let component: MotionPollFormComponent;
    let fixture: ComponentFixture<MotionPollFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
