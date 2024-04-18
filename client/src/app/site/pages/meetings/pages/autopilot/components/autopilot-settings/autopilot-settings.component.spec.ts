import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutopilotSettingsComponent } from './autopilot-settings.component';

xdescribe(`AutopilotSettingsComponent`, () => {
    let component: AutopilotSettingsComponent;
    let fixture: ComponentFixture<AutopilotSettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AutopilotSettingsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AutopilotSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
