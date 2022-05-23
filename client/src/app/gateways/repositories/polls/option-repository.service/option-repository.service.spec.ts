import { TestBed } from '@angular/core/testing';

import { OptionRepositoryService } from './option-repository.service';

describe(`OptionRepositoryService`, () => {
    let service: OptionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OptionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
