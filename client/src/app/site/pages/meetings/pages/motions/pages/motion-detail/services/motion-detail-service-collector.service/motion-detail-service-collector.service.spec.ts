import { TestBed } from '@angular/core/testing';

import { MotionDetailServiceCollectorService } from './motion-detail-service-collector.service';

describe('MotionDetailServiceCollectorService', () => {
    let service: MotionDetailServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionDetailServiceCollectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
