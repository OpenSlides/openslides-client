import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageSupportersComponent } from './motion-manage-supporters.component';

xdescribe('MotionManageSupportersComponent', () => {
    let component: MotionManageSupportersComponent;
    let fixture: ComponentFixture<MotionManageSupportersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MotionManageSupportersComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(MotionManageSupportersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
