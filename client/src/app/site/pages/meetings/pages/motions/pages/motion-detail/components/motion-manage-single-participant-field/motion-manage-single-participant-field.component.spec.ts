import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageSingleParticipantFieldComponent } from './motion-manage-single-participant-field.component';

xdescribe(`MotionManageSubmittersComponent`, () => {
    let component: MotionManageSingleParticipantFieldComponent;
    let fixture: ComponentFixture<MotionManageSingleParticipantFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManageSingleParticipantFieldComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageSingleParticipantFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
