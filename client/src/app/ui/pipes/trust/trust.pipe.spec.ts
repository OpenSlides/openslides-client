import { TrustPipe } from './trust.pipe';

describe('TrustPipe', () => {
    it('create an instance', () => {
        const pipe = new TrustPipe();
        expect(pipe).toBeTruthy();
    });
});
