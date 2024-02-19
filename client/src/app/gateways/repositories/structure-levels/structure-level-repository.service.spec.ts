import { TestBed } from '@angular/core/testing';

import { StructureLevelRepositoryService } from './structure-level-repository.service';

xdescribe(`StructureLevelRepositoryService`, () => {
    let service: StructureLevelRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StructureLevelRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
