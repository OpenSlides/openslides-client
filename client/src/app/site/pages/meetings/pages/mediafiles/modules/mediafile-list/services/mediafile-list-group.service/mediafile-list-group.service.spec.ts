import { TestBed } from '@angular/core/testing';

import { MediafileListGroupService } from './mediafile-list-group.service';

describe('MediafileListGroupService', () => {
    let service: MediafileListGroupService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileListGroupService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
