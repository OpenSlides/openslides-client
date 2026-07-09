import { TestBed } from '@angular/core/testing';

import { ScrollingTableCellLabelDirective } from './scrolling-table-cell-label.directive';

describe.skip(`ScrollingTableCellLabelDirective`, () => {
    let directive: ScrollingTableCellLabelDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(ScrollingTableCellLabelDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
