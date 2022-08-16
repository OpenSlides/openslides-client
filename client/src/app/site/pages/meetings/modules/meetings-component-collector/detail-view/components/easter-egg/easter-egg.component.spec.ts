import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasterEggComponent } from './easter-egg.component';

xdescribe(`EasterEggComponent`, () => {
    let component: EasterEggComponent;
    let fixture: ComponentFixture<EasterEggComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EasterEggComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EasterEggComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
