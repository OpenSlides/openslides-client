import { TestBed } from '@angular/core/testing';

import { MotionPermissionService } from './motion-permission.service';

describe('MotionPermissionService', () => {
    let service: MotionPermissionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPermissionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
