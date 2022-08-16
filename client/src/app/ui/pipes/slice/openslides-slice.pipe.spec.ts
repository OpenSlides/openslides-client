import { OpenSlidesSlicePipe } from './openslides-slice.pipe';

xdescribe(`OpenslidesSlicePipe`, () => {
    it(`create an instance`, () => {
        const pipe = new OpenSlidesSlicePipe();
        expect(pipe).toBeTruthy();
    });
});
