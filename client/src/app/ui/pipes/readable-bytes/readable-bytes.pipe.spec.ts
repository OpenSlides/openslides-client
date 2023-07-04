import { ReadableBytesPipe } from './readable-bytes.pipe';

describe(`ReadableBytesPipe`, () => {
    it(`transfor 0 Bytes to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(0)).toBe(`0 B`);
    });

    it(`transform 1 Byte to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(1)).toBe(`1 B`);
    });

    it(`transform  1kB to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(1024)).toBe(`1 kB`);
    });

    it(`transform  1MB to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(1048576)).toBe(`1 MB`);
    });

    it(`transform  1GB to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(1073741824)).toBe(`1 GB`);
    });

    it(`transform  1TB to string`, () => {
        const pipe = new ReadableBytesPipe();
        expect(pipe.transform(1099511627776)).toBe(`1 TB`);
    });
});
