import { TestBed } from '@angular/core/testing';

import { VotingBannerService } from './voting-banner.service';

describe('VotingBannerService', () => {
    let service: VotingBannerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VotingBannerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
