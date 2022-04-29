import { TestBed } from '@angular/core/testing';

import { GroupControllerService } from './group-controller.service';

describe('GroupControllerService', () => {
    let service: GroupControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GroupControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
