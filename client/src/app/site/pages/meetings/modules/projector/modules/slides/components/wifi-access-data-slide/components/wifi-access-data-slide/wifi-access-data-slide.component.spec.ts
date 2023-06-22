import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WifiAccessDataSlideComponent } from './wifi-access-data-slide.component';

describe(`WifiAccessDataSlideComponent`, () => {
    let component: WifiAccessDataSlideComponent;
    let fixture: ComponentFixture<WifiAccessDataSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WifiAccessDataSlideComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WifiAccessDataSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
