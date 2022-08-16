import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplauseBarDisplayComponent } from './applause-bar-display.component';

xdescribe(`ApplauseBarDisplayComponent`, () => {
    let component: ApplauseBarDisplayComponent;
    let fixture: ComponentFixture<ApplauseBarDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ApplauseBarDisplayComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ApplauseBarDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
