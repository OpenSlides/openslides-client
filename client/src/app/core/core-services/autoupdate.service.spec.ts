import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { AutoupdateService } from './autoupdate.service';

describe(`AutoupdateService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [AutoupdateService]
        });
    });

    it(`should be created`, inject([AutoupdateService], (service: AutoupdateService) => {
        expect(service).toBeTruthy();
    }));
});
