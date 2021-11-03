import { TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { BaseSortService } from './base-sort.service';

describe(`BaseSortService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [BaseSortService]
        });
    });

    // TODO testing (does not work without injecting a BaseComponent)
    //   it('should be created', () => {
    //     const service: BaseSortService = TestBed.inject(BaseSortService);
    //     expect(service).toBeTruthy();
    //   });
});
