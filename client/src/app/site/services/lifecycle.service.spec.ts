import { TestBed } from '@angular/core/testing';

import { LifecycleService } from './lifecycle.service';

describe('LifecycleService', () => {
    let service: LifecycleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LifecycleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
