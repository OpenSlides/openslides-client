import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { MotionManagePollsComponent } from './motion-manage-polls.component';

describe(`MotionManagePollsComponent`, () => {
    let component: MotionManagePollsComponent;
    let fixture: ComponentFixture<MotionManagePollsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [MotionManagePollsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManagePollsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
