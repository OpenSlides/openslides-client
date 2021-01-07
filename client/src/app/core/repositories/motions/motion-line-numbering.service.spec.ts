import { TestBed } from '@angular/core/testing';

import { MotionLineNumberingService } from './motion-line-numbering.service';

describe('MotionLineNumberingService', () => {
    let service: MotionLineNumberingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionLineNumberingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
