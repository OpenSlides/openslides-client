import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { MotionManageTitleComponent } from './motion-manage-title.component';

describe(`MotionManageTitleComponent`, () => {
    let component: MotionManageTitleComponent;
    let fixture: ComponentFixture<MotionManageTitleComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [MotionManageTitleComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
