import { PollParseNumberPipe } from './poll-parse-number.pipe';

describe('PollParseNumberPipe', () => {
    it('create an instance', () => {
        const pipe = new PollParseNumberPipe();
        expect(pipe).toBeTruthy();
    });
});
