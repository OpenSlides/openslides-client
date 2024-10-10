import { TestBed } from '@angular/core/testing';

import { GenderRepositoryService } from './gender-repository.service';

xdescribe(`GenderRepositoryService`, () => {
    let service: GenderRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GenderRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
