import { TestBed } from '@angular/core/testing';

import { CollectionMapperService } from './collection-mapper.service';
import { ViewModelStoreService } from './view-model-store.service';

class MockCollection {
    getViewModel = id => {
        return id == 1 ? { getTitle: () => `test` } : null;
    };

    getViewModelList = () => {
        return [{ getTitle: () => `test1` }, { getTitle: () => `test2` }];
    };
}

class MockCollectionMapperService {
    getRepository = _collectionType => {
        return new MockCollection();
    };
}

describe(`ViewModelStoreService`, () => {
    let service: ViewModelStoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ViewModelStoreService,
                { provide: CollectionMapperService, useClass: MockCollectionMapperService }
            ]
        });
        service = TestBed.inject(ViewModelStoreService);
    });

    it(`test get`, () => {
        expect(service.get(``, 1).getTitle()).toBe(`test`);
        expect(service.get(``, 2)).toBe(null);
    });

    it(`test getMany`, () => {
        expect(service.getMany(``, [1, 2, 3]).length).toBe(1);
        expect(service.getMany(``, [1, 2, 3]).map(e => e.getTitle())).toEqual([`test`]);
    });

    it(`test getAll`, () => {
        expect(service.getAll(``).map(e => e.getTitle())).toEqual([`test1`, `test2`]);
    });

    it(`test filter`, () => {
        expect(service.filter(``, model => model.getTitle() == `test1`).map(e => e.getTitle())).toEqual([`test1`]);
        expect(service.filter(``, _model => true).map(e => e.getTitle())).toEqual([`test1`, `test2`]);
        expect(service.filter(``, model => model.getTitle().startsWith(`test`)).map(e => e.getTitle())).toEqual([
            `test1`,
            `test2`
        ]);
    });
    it(`test find`, () => {
        expect(service.find(``, model => model.getTitle() == `test1`).getTitle()).toBe(`test1`);
        expect(service.find(``, model => model.getTitle() == `foo`)).toBe(undefined);
    });
});
