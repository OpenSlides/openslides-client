import { ToStringPipe } from './to-string.pipe';

xdescribe(`ToStringPipe`, () => {
    it(`create an instance`, () => {
        const pipe = new ToStringPipe();
        expect(pipe).toBeTruthy();
    });
});
