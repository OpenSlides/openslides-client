import { TestBed } from '@angular/core/testing';
import { StorageService } from 'src/app/gateways/storage.service';

import { OsFilter } from '../base/base-filter.service';
import { ActiveFiltersService } from './active-filters.service';

class MockStorageService {
    state = {};
    constructor() {}
    get = (key: string) => this.state[key];
    set = async (key: string, content: string) => {
        this.state[key] = content;
    };
}

class FilterOptions {
    foo: string;
}

class Filter implements OsFilter<FilterOptions> {
    property: keyof FilterOptions = `foo`;
    options = [];
}

describe(`ActiveFiltersService`, () => {
    let service: ActiveFiltersService;
    let storageService: StorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ActiveFiltersService, { provide: StorageService, useClass: MockStorageService }]
        });

        service = TestBed.inject(ActiveFiltersService);
        storageService = TestBed.inject(StorageService);
    });

    it(`check if key is loaded`, async () => {
        const value = [new Filter()];
        await storageService.set(`filter_example`, value);

        expect(await service.load<FilterOptions>(`example`)).toBe(value);
    });

    it(`check if value is stored`, async () => {
        const value = [new Filter()];
        await service.save<FilterOptions>(`example`, value);

        expect(await storageService.get(`filter_example`)).toEqual(value);
    });
});
