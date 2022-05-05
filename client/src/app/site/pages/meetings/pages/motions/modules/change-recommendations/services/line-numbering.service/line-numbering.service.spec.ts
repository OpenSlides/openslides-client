import { TestBed } from '@angular/core/testing';

import { LineNumberingService } from './line-numbering.service';

describe('LineNumberingService', () => {
    let service: LineNumberingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LineNumberingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
