import { TestBed } from '@angular/core/testing';

import { AgendaItemFilterService } from './agenda-item-filter.service';

describe(`AgendaItemFilterService`, () => {
    let service: AgendaItemFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaItemFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
