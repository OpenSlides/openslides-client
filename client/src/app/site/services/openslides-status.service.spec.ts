import { TestBed } from '@angular/core/testing';
import { Deferred } from 'src/app/infrastructure/utils/promises';

import { OpenSlidesStatusService } from './openslides-status.service';

describe(`OpenSlidesStatusService`, () => {
    let service: OpenSlidesStatusService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenSlidesStatusService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });

    it(`check stable`, () => {
        expect((service.stable as Deferred).wasResolved).toBe(false);
    });

    it(`observe isStable`, () => {
        let actualValue: boolean | undefined;
        service.isStableObservable.subscribe(value => {
            actualValue = value;
        });
        expect(actualValue).toBe(false);
        service.setStable();
        expect(actualValue).toBe(true);
        service.reset();
        expect(actualValue).toBe(true);
    });
});
