import { TestBed } from '@angular/core/testing';

import { ActionWorkerWatchService } from './action-worker-watch.service';

xdescribe(`BackendThreadWatcherService`, () => {
    let service: ActionWorkerWatchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActionWorkerWatchService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
