import { TestBed } from '@angular/core/testing';

import { ProjectableListService } from './projectable-list.service';

describe(`ProjectableListService`, () => {
    let service: ProjectableListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectableListService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
