import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { ModelRequestService } from './model-request.service';

describe(`ModelRequestService`, () => {
    let service: ModelRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(ModelRequestService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
