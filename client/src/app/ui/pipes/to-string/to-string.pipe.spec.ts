import { ToStringPipe } from './to-string.pipe';

fdescribe(`ToStringPipe`, () => {
    it(`test number to string`, () => {
        const pipe = new ToStringPipe();
        expect(pipe.transform(1)).toEqual(`1`);
    });

    it(`test input string`, () => {
        const pipe = new ToStringPipe();
        expect(pipe.transform(`a`)).toEqual(`a`);
    });

    it(`test with nothing`, () => {
        const pipe = new ToStringPipe();
        expect(pipe.transform()).toEqual(``);
    });

    it(`test with function`, () => {
        const pipe = new ToStringPipe();
        let func: () => number = function (): number {
            return 10;
        };
        expect(pipe.transform(func)).toEqual(`10`);
    });

    it(`test array to string`, () => {
        const pipe = new ToStringPipe();
        const array = [`a`, `b`, `c`];
        expect(pipe.transform(array, 1)).toEqual(`b`);
    });

    it(`test with object`, () => {
        const pipe = new ToStringPipe();
        const obj = {
            str: `a`,
            num: 1,
            func: () => {
                return 10;
            }
        };
        expect(pipe.transform(obj, `str`)).toEqual(`a`);
        expect(pipe.transform(obj, `num`)).toEqual(`1`);
        expect(pipe.transform(obj, `func`)).toEqual(`10`);
    });
});
