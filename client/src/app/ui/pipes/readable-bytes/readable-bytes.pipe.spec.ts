import { ReadableBytesPipe } from './readable-bytes.pipe';

describe(`ReadableBytesPipe`, () => {
    it(`create an instance`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe).toBeTruthy();
    });
});
