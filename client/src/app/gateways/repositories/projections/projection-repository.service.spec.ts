import { TestBed } from '@angular/core/testing';

import { ProjectionRepositoryService } from './projection-repository.service';

xdescribe(`ProjectionRepositoryService`, () => {
    let service: ProjectionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
