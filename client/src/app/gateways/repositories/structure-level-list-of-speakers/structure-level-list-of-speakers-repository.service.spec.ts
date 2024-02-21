import { TestBed } from '@angular/core/testing';

import { StructureLevelListOfSpeakersRepositoryService } from './structure-level-list-of-speakers-repository.service';

xdescribe(`StructureLevelListOfSpeakersRepositoryService`, () => {
    let service: StructureLevelListOfSpeakersRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StructureLevelListOfSpeakersRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
