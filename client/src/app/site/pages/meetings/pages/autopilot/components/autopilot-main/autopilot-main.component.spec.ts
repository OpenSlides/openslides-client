import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutopilotMainComponent } from './autopilot-main.component';

xdescribe(`AutopilotMainComponent`, () => {
    let component: AutopilotMainComponent;
    let fixture: ComponentFixture<AutopilotMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AutopilotMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AutopilotMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
