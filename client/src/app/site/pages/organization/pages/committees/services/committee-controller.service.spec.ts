import { TestBed } from '@angular/core/testing';

import { CommitteeControllerService } from './committee-controller.service';

describe(`CommitteeControllerService`, () => {
    let service: CommitteeControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
