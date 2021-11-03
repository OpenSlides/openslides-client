import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { AppLoadService } from './app-load.service';

describe(`AppLoadService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [AppLoadService]
        });
    });
    it(`should be created`, inject([AppLoadService], (service: AppLoadService) => {
        expect(service).toBeTruthy();
    }));
});
