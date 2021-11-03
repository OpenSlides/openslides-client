import { inject, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { AgendaItemRepositoryService } from './agenda-item-repository.service';

describe(`AgendaItemRepositoryService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [AgendaItemRepositoryService]
        });
    });

    it(`should be created`, inject([AgendaItemRepositoryService], (service: AgendaItemRepositoryService) => {
        expect(service).toBeTruthy();
    }));
});
