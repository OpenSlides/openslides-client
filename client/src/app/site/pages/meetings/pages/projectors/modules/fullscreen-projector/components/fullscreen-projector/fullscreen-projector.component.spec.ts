import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenProjectorComponent } from './fullscreen-projector.component';

xdescribe(`FullscreenProjectorComponent`, () => {
    let component: FullscreenProjectorComponent;
    let fixture: ComponentFixture<FullscreenProjectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FullscreenProjectorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FullscreenProjectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
