import { TestBed } from '@angular/core/testing';

import { InteractionReceiveService } from './interaction-receive.service';

xdescribe(`InteractionReceiveService`, () => {
    let service: InteractionReceiveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InteractionReceiveService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
