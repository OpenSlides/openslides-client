import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionAddPollButtonComponent } from './motion-add-poll-button.component';

xdescribe(`MotionAddPollButtonComponent`, () => {
    let component: MotionAddPollButtonComponent;
    let fixture: ComponentFixture<MotionAddPollButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionAddPollButtonComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionAddPollButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
