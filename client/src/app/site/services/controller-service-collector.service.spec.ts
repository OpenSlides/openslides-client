import { TestBed } from '@angular/core/testing';

import { ControllerServiceCollectorService } from './controller-service-collector.service';

describe('ControllerServiceCollectorService', () => {
    let service: ControllerServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ControllerServiceCollectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
