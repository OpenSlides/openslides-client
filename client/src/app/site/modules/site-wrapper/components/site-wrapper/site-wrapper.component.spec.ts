import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWrapperComponent } from './site-wrapper.component';

xdescribe(`SiteWrapperComponent`, () => {
    let component: SiteWrapperComponent;
    let fixture: ComponentFixture<SiteWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SiteWrapperComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SiteWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
