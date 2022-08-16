import { TestBed } from '@angular/core/testing';

import { GroupRepositoryService } from './group-repository.service';

xdescribe(`GroupRepositoryService`, () => {
    let service: GroupRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GroupRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
