import { TestBed } from '@angular/core/testing';

import { SubdivisionRepositoryService } from './subdivision-repository.service';

xdescribe(`SubdivisionRepositoryService`, () => {
    let service: SubdivisionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SubdivisionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
