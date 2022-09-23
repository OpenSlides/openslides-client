import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionMultiselectActionsComponent } from './motion-multiselect-actions.component';

xdescribe(`MotionMultiselectActionsComponent`, () => {
    let component: MotionMultiselectActionsComponent;
    let fixture: ComponentFixture<MotionMultiselectActionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionMultiselectActionsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionMultiselectActionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
