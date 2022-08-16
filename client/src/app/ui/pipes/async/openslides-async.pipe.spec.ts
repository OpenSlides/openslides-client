import { TestBed } from '@angular/core/testing';

import { OpenSlidesAsyncPipe } from './openslides-async.pipe';

xdescribe(`OpenslidesAsyncPipe`, () => {
    let pipe: OpenSlidesAsyncPipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        pipe = TestBed.inject(OpenSlidesAsyncPipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
