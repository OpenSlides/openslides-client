import { TestBed } from '@angular/core/testing';

import { CollectionMapperService } from './collection-mapper.service';

describe('CollectionMapperService', () => {
    let service: CollectionMapperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CollectionMapperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
