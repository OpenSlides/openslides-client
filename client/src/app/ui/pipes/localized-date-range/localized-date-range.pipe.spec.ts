import { TestBed } from '@angular/core/testing';

import { LocalizedDateRangePipe } from './localized-date-range.pipe';

xdescribe(`LocalizedDateRangePipe`, () => {
    let pipe: LocalizedDateRangePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(LocalizedDateRangePipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
