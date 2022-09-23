import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { AgendaItemListModule } from '../../agenda-item-list.module';
import { AgendaItemMultiselectService } from './agenda-item-multiselect.service';

describe(`AgendaItemMultiselectService`, () => {
    let service: AgendaItemMultiselectService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule, AgendaItemListModule]
        });
        service = TestBed.inject(AgendaItemMultiselectService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
