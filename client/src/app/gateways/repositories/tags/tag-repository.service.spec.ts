import { TestBed } from '@angular/core/testing';

import { TagRepositoryService } from './tag-repository.service';

describe(`TagRepositoryService`, () => {
    let service: TagRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TagRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
