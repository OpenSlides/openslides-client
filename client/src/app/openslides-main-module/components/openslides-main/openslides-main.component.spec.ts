import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSlidesMainComponent } from './openslides-main.component';

xdescribe(`OpenslidesMainComponent`, () => {
    let component: OpenSlidesMainComponent;
    let fixture: ComponentFixture<OpenSlidesMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OpenSlidesMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OpenSlidesMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
