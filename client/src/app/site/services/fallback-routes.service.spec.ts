import { TestBed } from '@angular/core/testing';

import { FallbackRoutesService } from './fallback-routes.service';

describe('FallbackRoutesService', () => {
    let service: FallbackRoutesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FallbackRoutesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
