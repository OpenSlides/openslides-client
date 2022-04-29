import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionExtensionFieldComponent } from './motion-extension-field.component';

describe('MotionExtensionFieldComponent', () => {
    let component: MotionExtensionFieldComponent;
    let fixture: ComponentFixture<MotionExtensionFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionExtensionFieldComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionExtensionFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
