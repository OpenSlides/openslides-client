import { TestBed } from '@angular/core/testing';

import { ProjectorRepositoryService } from './projector-repository.service';

xdescribe(`ProjectorRepositoryService`, () => {
    let service: ProjectorRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
