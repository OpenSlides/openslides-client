import { TestBed } from '@angular/core/testing';

import { FallbackRoutesService } from './fallback-routes.service';
import { OperatorService } from './operator.service';

class MockOperatorService {
    hasPerms = _perm => true;
}

describe(`FallbackRoutesService`, () => {
    let service: FallbackRoutesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FallbackRoutesService, { provide: OperatorService, useClass: MockOperatorService }]
        });
        service = TestBed.inject(FallbackRoutesService);
    });

    it(`registerFallbackEntries and getFallbackRoute`, () => {
        service.registerFallbackEntries([{ route: `test`, weight: 2 }]);
        expect(service.getFallbackRoute()).toEqual(`test`);
    });

    it(`getFallbackRoute should be empty`, () => {
        expect(service.getFallbackRoute()).toBe(null);
    });

    it(`check sorting of registerFallbackEntries`, () => {
        service.registerFallbackEntries([
            { route: `test_3`, weight: 3 },
            { route: `test_1`, weight: 1 },
            { route: `test_2`, weight: 2 }
        ]);
        expect(service.getFallbackRoute()).toEqual(`test_1`);
    });
});
