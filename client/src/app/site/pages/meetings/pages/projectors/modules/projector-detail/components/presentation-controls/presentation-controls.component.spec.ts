import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationControlsComponent } from './presentation-controls.component';

xdescribe(`PresentationControlsComponent`, () => {
    let component: PresentationControlsComponent;
    let fixture: ComponentFixture<PresentationControlsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PresentationControlsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PresentationControlsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
