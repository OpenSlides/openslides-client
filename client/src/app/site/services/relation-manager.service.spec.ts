import { TestBed } from '@angular/core/testing';

import { RelationManagerService } from './relation-manager.service';

xdescribe(`RelationManagerService`, () => {
    let service: RelationManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RelationManagerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
