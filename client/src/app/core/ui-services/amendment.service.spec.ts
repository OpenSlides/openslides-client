import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { AmendmentService } from './amendment.service';

describe(`AmendmentService`, () => {
    let service: AmendmentService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(AmendmentService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
