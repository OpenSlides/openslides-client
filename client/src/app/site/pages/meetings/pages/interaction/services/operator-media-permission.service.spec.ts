import { TestBed } from '@angular/core/testing';

import { OperatorMediaPermissionService } from './operator-media-permission.service';

describe('OperatorMediaPermissionService', () => {
    let service: OperatorMediaPermissionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OperatorMediaPermissionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
