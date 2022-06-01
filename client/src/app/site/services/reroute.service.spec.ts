import { TestBed } from '@angular/core/testing';

import { RerouteService } from './reroute.service';

describe(`RerouteService`, () => {
    let service: RerouteService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RerouteService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
