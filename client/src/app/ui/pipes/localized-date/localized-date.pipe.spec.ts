import { TestBed } from '@angular/core/testing';

import { LocalizedDatePipe } from './localized-date.pipe';

xdescribe(`LocalizedDatePipe`, () => {
    let pipe: LocalizedDatePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(LocalizedDatePipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
