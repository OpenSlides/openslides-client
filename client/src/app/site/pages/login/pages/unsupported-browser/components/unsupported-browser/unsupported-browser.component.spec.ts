import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsupportedBrowserComponent } from './unsupported-browser.component';

xdescribe(`UnsupportedBrowserComponent`, () => {
    let component: UnsupportedBrowserComponent;
    let fixture: ComponentFixture<UnsupportedBrowserComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UnsupportedBrowserComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UnsupportedBrowserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
