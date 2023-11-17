import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ViewPortService } from './view-port.service';

class MockBreakpointObserver {
    observe = _arr => new BehaviorSubject<BreakpointState>({ matches: true, breakpoints: {} });
}

describe(`ViewPortService`, () => {
    let service: ViewPortService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ViewPortService, { provide: BreakpointObserver, useClass: MockBreakpointObserver }]
        });
        service = TestBed.inject(ViewPortService);
    });

    it(`check if isMobile is set by checkForChange`, () => {
        expect(service.isMobile).toBe(true);
    });

    it(`check if isMobileSubject can be used`, () => {
        service.isMobileSubject.next(false);
        expect(service.isMobile).toBe(false);
    });
});
