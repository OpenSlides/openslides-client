import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSlidesOverlayContainerComponent } from './openslides-overlay-container.component';

xdescribe(`OpenslidesOverlayContainerComponent`, () => {
    let component: OpenSlidesOverlayContainerComponent;
    let fixture: ComponentFixture<OpenSlidesOverlayContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OpenSlidesOverlayContainerComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OpenSlidesOverlayContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
