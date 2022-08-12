import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { AppLoadService } from './app-load.service';

describe(`AppLoadService`, () => {
    let service: AppLoadService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(AppLoadService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
