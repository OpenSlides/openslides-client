import { TestBed } from '@angular/core/testing';

import { TreeSortService } from './tree-sort.service';

describe('TreeSortService', () => {
    let service: TreeSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TreeSortService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
