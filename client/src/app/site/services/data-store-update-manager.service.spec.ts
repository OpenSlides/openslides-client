import { TestBed } from '@angular/core/testing';

import { DataStoreUpdateManagerService } from './data-store-update-manager.service';

xdescribe(`DataStoreUpdateManagerService`, () => {
    let service: DataStoreUpdateManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DataStoreUpdateManagerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
