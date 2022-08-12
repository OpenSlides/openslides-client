import { TestBed } from '@angular/core/testing';

import { ImportServiceCollectorService } from './import-service-collector.service';

xdescribe(`ImportServiceCollectorService`, () => {
    let service: ImportServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImportServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
