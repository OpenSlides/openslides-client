import { TestBed } from '@angular/core/testing';

import { GetUserRelatedModelsPresenterService } from './get-user-related-models-presenter.service';

xdescribe(`GetUserRelatedModelsPresenterService`, () => {
    let service: GetUserRelatedModelsPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GetUserRelatedModelsPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
