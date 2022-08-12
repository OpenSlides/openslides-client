import { TestBed } from '@angular/core/testing';

import { MediafileRepositoryService } from './mediafile-repository.service';

xdescribe(`MediafileRepositoryService`, () => {
    let service: MediafileRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
