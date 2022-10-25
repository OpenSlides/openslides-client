import { TestBed } from '@angular/core/testing';

import { VoteDecryptGatewayService } from './vote-decrypt-gateway.service';

xdescribe(`VoteDecryptGatewayService`, () => {
    let service: VoteDecryptGatewayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VoteDecryptGatewayService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
