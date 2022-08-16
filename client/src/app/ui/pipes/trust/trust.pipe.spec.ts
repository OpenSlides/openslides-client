import { TestBed } from '@angular/core/testing';

import { TrustPipe } from './trust.pipe';

xdescribe(`TrustPipe`, () => {
    let pipe: TrustPipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(TrustPipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
