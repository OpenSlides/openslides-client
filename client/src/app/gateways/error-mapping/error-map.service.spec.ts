import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { ErrorMapService } from './error-map.service';

xdescribe(`ErrorMapService`, () => {
    let service: ErrorMapService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(ErrorMapService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
