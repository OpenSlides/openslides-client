import { TestBed } from '@angular/core/testing';

import { RoutingStateService } from './routing-state.service';

xdescribe(`RoutingStateService`, () => {
    let service: RoutingStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RoutingStateService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
