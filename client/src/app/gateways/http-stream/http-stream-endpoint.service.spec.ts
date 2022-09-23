import { TestBed } from '@angular/core/testing';

import { HttpStreamEndpointService } from './http-stream-endpoint.service';

xdescribe(`HttpStreamEndpointService`, () => {
    let service: HttpStreamEndpointService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HttpStreamEndpointService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
