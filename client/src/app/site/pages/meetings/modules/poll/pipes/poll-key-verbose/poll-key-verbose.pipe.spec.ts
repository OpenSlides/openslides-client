import { PollKeyVerbosePipe } from './poll-key-verbose.pipe';

xdescribe(`PollKeyVerbosePipe`, () => {
    it(`create an instance`, () => {
        const pipe = new PollKeyVerbosePipe();
        expect(pipe).toBeTruthy();
    });
});
