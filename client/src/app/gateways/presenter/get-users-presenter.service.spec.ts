import { TestBed } from '@angular/core/testing';

import { GetUsersPresenterService } from './get-users-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

function checkProperty(property: any, type: `string` | `number` | `boolean`): boolean {
    return property !== undefined && typeof property !== type;
}

describe(`GetUsersPresenterService`, () => {
    let service: GetUsersPresenterService;
    let presenter: MockPresenterService;

    const testUsers = [
        {
            id: 2,
            username: `user2`,
            first_name: `User`,
            last_name: `Two`
        },
        {
            id: 3,
            username: `user3`,
            first_name: `User`,
            last_name: `Three`
        },
        {
            id: 4,
            username: `user4`,
            first_name: `User`,
            last_name: `Four`
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GetUsersPresenterService, { provide: PresenterService, useClass: MockPresenterService }]
        });

        service = TestBed.inject(GetUsersPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.GET_USERS, (data?: any) => {
            if (
                !data ||
                typeof data !== `object` ||
                Object.keys(data).some(
                    key => ![`start_index`, `entries`, `sort_criteria`, `reverse`, `filter`].includes(key)
                ) ||
                checkProperty(data.start_index, `number`) ||
                checkProperty(data.entries, `number`) ||
                checkProperty(data.reverse, `boolean`) ||
                (data.sort_criteria !== undefined &&
                    (!Array.isArray(data.sort_criteria) ||
                        (data.sort_criteria as any[]).some(
                            criteria => ![`username`, `first_name`, `last_name`].includes(criteria)
                        ))) ||
                checkProperty(data.filter, `string`)
            ) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return { returnValue: testUsers };
        });
    });

    it(`should correctly call get_users`, async () => {
        expect(await service.call({ start_index: 7, entries: 3 })).toEqual(testUsers);
        expect(await service.call({})).toEqual(testUsers);
    });
});
