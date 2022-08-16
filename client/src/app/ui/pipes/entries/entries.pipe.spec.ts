import { TestBed } from '@angular/core/testing';

import { EntriesPipe } from './entries.pipe';

xdescribe(`EntriesPipe`, () => {
    let pipe: EntriesPipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(EntriesPipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
