import { TestBed } from '@angular/core/testing';

import { TagRepositoryService } from './tag-repository.service';

xdescribe(`TagRepositoryService`, () => {
    let service: TagRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TagRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
