import { TestBed } from '@angular/core/testing';

import { ParticipantImportService } from './participant-import.service';

describe(`ParticipantImportService`, () => {
    let service: ParticipantImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantImportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
