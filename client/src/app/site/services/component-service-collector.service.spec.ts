import { TestBed } from '@angular/core/testing';

import { ComponentServiceCollectorService } from './component-service-collector.service';

xdescribe(`ComponentServiceCollectorService`, () => {
    let service: ComponentServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ComponentServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
