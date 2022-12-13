import { TestBed } from '@angular/core/testing';

import { SearchDeletedModelsPresenterService } from './search-deleted-models-presenter.service';

xdescribe(`SearchDeletedModelsPresenterService`, () => {
    let service: SearchDeletedModelsPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SearchDeletedModelsPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
