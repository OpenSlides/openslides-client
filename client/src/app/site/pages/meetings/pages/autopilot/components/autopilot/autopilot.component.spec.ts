import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutopilotComponent } from './autopilot.component';

xdescribe(`AutopilotComponent`, () => {
    let component: AutopilotComponent;
    let fixture: ComponentFixture<AutopilotComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AutopilotComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AutopilotComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
