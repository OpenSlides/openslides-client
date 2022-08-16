import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageTitleComponent } from './motion-manage-title.component';

xdescribe(`MotionManageTitleComponent`, () => {
    let component: MotionManageTitleComponent;
    let fixture: ComponentFixture<MotionManageTitleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManageTitleComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
