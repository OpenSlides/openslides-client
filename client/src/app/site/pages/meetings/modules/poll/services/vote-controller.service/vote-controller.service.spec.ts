import { TestBed } from '@angular/core/testing';

import { VoteControllerService } from './vote-controller.service';

describe('VoteControllerService', () => {
    let service: VoteControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VoteControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
