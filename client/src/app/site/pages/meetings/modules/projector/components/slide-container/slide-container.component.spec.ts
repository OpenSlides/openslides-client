import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideContainerComponent } from './slide-container.component';

xdescribe(`SlideContainerComponent`, () => {
    let component: SlideContainerComponent;
    let fixture: ComponentFixture<SlideContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SlideContainerComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SlideContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
