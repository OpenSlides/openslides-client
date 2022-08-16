import { TestBed } from '@angular/core/testing';

import { CommitteeDetailSharedContextService } from './committee-detail-shared-context.service';

xdescribe(`CommitteeDetailSharedContextService`, () => {
    let service: CommitteeDetailSharedContextService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeDetailSharedContextService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
