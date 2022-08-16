import { TestBed } from '@angular/core/testing';

import { ScrollingTableNoDataDirective } from './scrolling-table-no-data.directive';

xdescribe(`ScrollingTableNoDataDirective`, () => {
    let directive: ScrollingTableNoDataDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(ScrollingTableNoDataDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
