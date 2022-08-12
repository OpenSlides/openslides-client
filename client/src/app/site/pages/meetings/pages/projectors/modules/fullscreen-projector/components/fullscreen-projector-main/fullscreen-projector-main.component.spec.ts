import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenProjectorMainComponent } from './fullscreen-projector-main.component';

xdescribe(`FullscreenProjectorMainComponent`, () => {
    let component: FullscreenProjectorMainComponent;
    let fixture: ComponentFixture<FullscreenProjectorMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FullscreenProjectorMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FullscreenProjectorMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
