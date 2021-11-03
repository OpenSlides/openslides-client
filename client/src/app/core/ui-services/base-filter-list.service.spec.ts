import { TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { BaseFilterListService } from './base-filter-list.service';

describe(`BaseFilterListService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [BaseFilterListService]
        });
    });

    // TODO testing needs an actual service..
    // it('should be created', inject([FilterListService], (service: FilterListService) => {
    //     expect(service).toBeTruthy();
    // }));
});
