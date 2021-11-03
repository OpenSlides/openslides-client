import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { PollService } from './poll.service';

describe(`PollService`, () => {
    let service: PollService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(PollService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
