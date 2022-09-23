import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplauseParticleDisplayComponent } from './applause-particle-display.component';

xdescribe(`ApplauseParticleDisplayComponent`, () => {
    let component: ApplauseParticleDisplayComponent;
    let fixture: ComponentFixture<ApplauseParticleDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ApplauseParticleDisplayComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ApplauseParticleDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
