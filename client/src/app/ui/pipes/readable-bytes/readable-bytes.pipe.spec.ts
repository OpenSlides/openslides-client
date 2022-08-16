import { ReadableBytesPipe } from './readable-bytes.pipe';

xdescribe(`ReadableBytesPipe`, () => {
    it(`create an instance`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe).toBeTruthy();
    });
});
