import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollMetaInformationComponent } from './motion-poll-meta-information.component';

xdescribe(`MotionPollMetaInformationComponent`, () => {
    let component: MotionPollMetaInformationComponent;
    let fixture: ComponentFixture<MotionPollMetaInformationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollMetaInformationComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollMetaInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
