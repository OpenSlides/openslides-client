import { TestBed } from '@angular/core/testing';

import { OperatorService } from './operator.service';

xdescribe(`OperatorService`, () => {
    let service: OperatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OperatorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
