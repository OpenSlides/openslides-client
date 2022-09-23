import { TestBed } from '@angular/core/testing';

import { TimePipe } from './time.pipe';

xdescribe(`TimePipe`, () => {
    let pipe: TimePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(TimePipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
