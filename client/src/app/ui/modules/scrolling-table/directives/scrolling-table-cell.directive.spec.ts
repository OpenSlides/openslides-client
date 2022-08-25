import { TestBed } from '@angular/core/testing';

import { ScrollingTableCellDirective } from './scrolling-table-cell.directive';

xdescribe(`ScrollingTableCellDirective`, () => {
    let directive: ScrollingTableCellDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(ScrollingTableCellDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
