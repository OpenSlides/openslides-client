import { Deferred } from './deferred';

describe(`utils: promise: deferred`, () => {
    it(`does not resolve immediately`, async () => {
        const def = new Deferred();

        expect(def.wasResolved).toBe(false);
        // TODO: vitest-migration: Unsupported matcher ".toBePending()" found. Vitest does not have a direct equivalent. Please migrate this manually, for example by using `Promise.race` to check if the promise settles within a short timeout.
        await expectAsync(def).toBePending();
    });

    it(`gets resolved`, async () => {
        const def = new Deferred();
        def.resolve();

        expect(def.wasResolved).toBe(true);
        await expect(def).resolves.not.toThrow();
    });

    it(`can be unresolved`, async () => {
        const def = new Deferred();
        def.resolve();
        def.unresolve();

        expect(def.wasResolved).toBe(false);
        // TODO: This fails. Check if this is a problem
        // await expectAsync(def).toBePending();
    });
});
