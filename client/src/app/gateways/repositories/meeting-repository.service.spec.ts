import { TestBed } from '@angular/core/testing';

import { MeetingRepositoryService } from './meeting-repository.service';

describe('MeetingRepositoryService', () => {
    let service: MeetingRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
