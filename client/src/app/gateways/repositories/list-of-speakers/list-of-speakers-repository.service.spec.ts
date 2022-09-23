import { TestBed } from '@angular/core/testing';

import { ListOfSpeakersRepositoryService } from './list-of-speakers-repository.service';

xdescribe(`ListOfSpeakersRepositoryService`, () => {
    let service: ListOfSpeakersRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ListOfSpeakersRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
