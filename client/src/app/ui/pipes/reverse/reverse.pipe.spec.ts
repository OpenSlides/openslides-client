import { ReversePipe } from './reverse.pipe';

xdescribe(`ReversePipe`, () => {
    it(`create an instance`, () => {
        const pipe = new ReversePipe();
        expect(pipe).toBeTruthy();
    });
});
