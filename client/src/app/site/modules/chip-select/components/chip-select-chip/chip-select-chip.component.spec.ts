import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipSelectChipComponent } from './chip-select-chip.component';

xdescribe(`ChipSelectChipComponent`, () => {
    let component: ChipSelectChipComponent;
    let fixture: ComponentFixture<ChipSelectChipComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChipSelectChipComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ChipSelectChipComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
