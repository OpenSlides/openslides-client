import { TestBed } from '@angular/core/testing';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';
import { SearchDeletedModelsPresenterService } from './search-deleted-models-presenter.service';

describe(`SearchDeletedModelsPresenterService`, () => {
    let service: SearchDeletedModelsPresenterService;
    let presenter: MockPresenterService;

    const testMotions = {
        1: { id: 1, number: `A01`, title: `Tell John Doe to get new refreshments` },
        2: { id: 2, number: `Doe`, title: `Change the corporate design to "Green"` },
        5: { id: 5, number: `B10`, title: `Does anyone else want ice cream right now?` }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SearchDeletedModelsPresenterService,
                { provide: PresenterService, useClass: MockPresenterService }
            ]
        });

        service = TestBed.inject(SearchDeletedModelsPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.SEARCH_DELETED_MODELS, (data?: any) => {
            if (
                !data ||
                !(typeof data === `object`) ||
                Object.keys(data).length !== 3 ||
                typeof data.collection !== `string` ||
                typeof data.filter_string !== `string` ||
                typeof data.meeting_id !== `number`
            ) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return { returnValue: testMotions };
        });
    });

    it(`should correctly call search_deleted_models`, async () => {
        expect(await service.call({ collection: `motion`, filter_string: `Doe`, meeting_id: 2 })).toEqual(testMotions);
    });
});
