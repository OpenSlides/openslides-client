import { TestBed } from '@angular/core/testing';

import { ViewModelStoreUpdateService } from './view-model-store-update.service';

xdescribe(`ViewModelStoreUdpateService`, () => {
    let service: ViewModelStoreUpdateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ViewModelStoreUpdateService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
