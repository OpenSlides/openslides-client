import { TestBed } from '@angular/core/testing';

import { ParticipantRepositoryService } from './participant-repository.service';

describe(`ParticipantRepositoryService`, () => {
    let service: ParticipantRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
