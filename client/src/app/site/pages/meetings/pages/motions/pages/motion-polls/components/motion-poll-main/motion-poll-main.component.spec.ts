import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollMainComponent } from './motion-poll-main.component';

describe(`MotionPollMainComponent`, () => {
    let component: MotionPollMainComponent;
    let fixture: ComponentFixture<MotionPollMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
