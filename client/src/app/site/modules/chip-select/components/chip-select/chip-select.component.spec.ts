import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipSelectComponent } from './chip-select.component';

describe(`ChipSelectComponent`, () => {
    let component: ChipSelectComponent;
    let fixture: ComponentFixture<ChipSelectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChipSelectComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ChipSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
