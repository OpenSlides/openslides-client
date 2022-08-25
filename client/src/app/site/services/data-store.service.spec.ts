import { TestBed } from '@angular/core/testing';

import { DataStoreService } from './data-store.service';

xdescribe(`DataStoreService`, () => {
    let service: DataStoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DataStoreService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
