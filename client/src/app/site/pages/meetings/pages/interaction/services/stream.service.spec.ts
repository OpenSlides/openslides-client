import { TestBed } from '@angular/core/testing';

import { StreamService } from './stream.service';

xdescribe(`StreamService`, () => {
    let service: StreamService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StreamService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
