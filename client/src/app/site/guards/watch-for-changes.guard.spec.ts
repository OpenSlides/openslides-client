import { TestBed } from '@angular/core/testing';

import { WatchForChangesGuard } from './watch-for-changes.guard';

xdescribe(`WatchForChangesGuard`, () => {
    let guard: WatchForChangesGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        guard = TestBed.inject(WatchForChangesGuard);
    });

    it(`should be created`, () => {
        expect(guard).toBeTruthy();
    });
});
