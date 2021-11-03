import { TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { BaseSortListService } from './base-sort-list.service';

describe(`BaseSortListService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [BaseSortListService]
        });
    });

    // TODO testing (does not work without injecting a BaseComponent)
    // it('should be created', inject([SortListService], (service: SortListService) => {
    //     expect(service).toBeTruthy();
    // }));
});
