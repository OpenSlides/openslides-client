import { ToArrayPipe } from './to-array.pipe';

xdescribe(`ToArrayPipe`, () => {
    it(`create an instance`, () => {
        const pipe = new ToArrayPipe();
        expect(pipe).toBeTruthy();
    });
});
