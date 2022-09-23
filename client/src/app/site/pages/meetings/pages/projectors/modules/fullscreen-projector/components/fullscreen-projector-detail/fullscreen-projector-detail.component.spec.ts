import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenProjectorDetailComponent } from './fullscreen-projector-detail.component';

xdescribe(`FullscreenProjectorDetailComponent`, () => {
    let component: FullscreenProjectorDetailComponent;
    let fixture: ComponentFixture<FullscreenProjectorDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FullscreenProjectorDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FullscreenProjectorDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
