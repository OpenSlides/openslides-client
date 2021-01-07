import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageTitleComponent } from './motion-manage-title.component';

describe('MotionManageTitleComponent', () => {
    let component: MotionManageTitleComponent;
    let fixture: ComponentFixture<MotionManageTitleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MotionManageTitleComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
