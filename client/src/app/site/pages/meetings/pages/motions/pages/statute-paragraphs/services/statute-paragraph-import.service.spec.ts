import { TestBed } from '@angular/core/testing';

import { StatuteParagraphImportService } from './statute-paragraph-import.service';

describe('StatuteParagraphImportService', () => {
    let service: StatuteParagraphImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StatuteParagraphImportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
