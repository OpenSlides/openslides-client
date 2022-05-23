import { TestBed } from '@angular/core/testing';

import { SpeakerRepositoryService } from './speaker-repository.service';

describe(`SpeakerRepositoryService`, () => {
    let service: SpeakerRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeakerRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
