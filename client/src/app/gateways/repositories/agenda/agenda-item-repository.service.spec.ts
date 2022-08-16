import { TestBed } from '@angular/core/testing';

import { AgendaItemRepositoryService } from './agenda-item-repository.service';

xdescribe(`AgendaItemRepositoryService`, () => {
    let service: AgendaItemRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaItemRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
