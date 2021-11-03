import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { ErrorService } from './error.service';

describe(`ErrorService`, () => {
    let service: ErrorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(ErrorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
