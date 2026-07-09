import { Mutex } from './mutex';

describe(`utils: promise: mutex`, () => {
    it(`locks critical path`, async () => {
        const mutex = new Mutex();
        const firstLock = mutex.lock();
        const secLock = mutex.lock();

        await expect(firstLock).resolves.not.toThrow();
        // TODO: vitest-migration: Unsupported matcher ".toBePending()" found. Vitest does not have a direct equivalent. Please migrate this manually, for example by using `Promise.race` to check if the promise settles within a short timeout.
        await expectAsync(secLock).toBePending();
    });

    it(`unlocks critical path`, async () => {
        const mutex = new Mutex();
        const firstLock = mutex.lock();
        const secLock = mutex.lock();

        await expect(firstLock).resolves.not.toThrow();
        (await firstLock)();

        await expect(secLock).resolves.not.toThrow();
    });
});
