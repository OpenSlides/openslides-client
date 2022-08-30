import { TestBed } from '@angular/core/testing';

import { HttpStreamService } from './http-stream.service';

xdescribe(`HttpStreamService`, () => {
    let service: HttpStreamService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HttpStreamService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
