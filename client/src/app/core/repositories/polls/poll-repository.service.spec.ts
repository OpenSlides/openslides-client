import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { PollRepositoryService } from './poll-repository.service';

describe(`PollRepositoryService`, () => {
    let service: PollRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(PollRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
