import { Mutex } from './mutex';

describe(`utils: promise: mutex`, () => {
    it(`locks critical path`, async () => {
        const mutex = new Mutex();
        const firstLock = mutex.lock();
        const secLock = mutex.lock();

        await expectAsync(firstLock).toBeResolved();
        await expectAsync(secLock).toBePending();
    });

    it(`unlocks critical path`, async () => {
        const mutex = new Mutex();
        const firstLock = mutex.lock();
        const secLock = mutex.lock();

        await expectAsync(firstLock).toBeResolved();
        (await firstLock)();

        await expectAsync(secLock).toBeResolved();
    });
});
