import { TestBed } from '@angular/core/testing';

import { SequentialNumberMappingService } from './sequential-number-mapping.service';

describe(`SequentialNumberMappingService`, () => {
    let service: SequentialNumberMappingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SequentialNumberMappingService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
