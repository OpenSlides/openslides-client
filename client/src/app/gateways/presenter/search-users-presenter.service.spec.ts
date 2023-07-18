import { TestBed } from '@angular/core/testing';
import { UserScope } from 'src/app/site/services/user.service';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';
import { SearchUsersPresenterService } from './search-users-presenter.service';

describe(`SearchUsersPresenterService`, () => {
    let service: SearchUsersPresenterService;
    let presenter: MockPresenterService;

    const testUsers = [
        { id: 2, username: `johnDoe`, email: `john.doe@email.en`, first_name: `John`, last_name: `Doe` },
        { id: 3, username: `jd`, email: `joanna.doe@email.en`, first_name: `Joanna`, last_name: `Doe` },
        { id: 4, username: `johnsSecondAccount`, email: `john.doe@email.en`, first_name: `John`, last_name: `Doe` },
        { id: 5, username: `rando`, first_name: `Rando`, last_name: `Mized` }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SearchUsersPresenterService, { provide: PresenterService, useClass: MockPresenterService }]
        });

        service = TestBed.inject(SearchUsersPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.SEARCH_USERS, (data?: any) => {
            if (
                !data ||
                typeof data !== `object` ||
                Object.keys(data).some(key => ![`permission_type`, `permission_id`, `search`].includes(key)) ||
                ![`meeting`, `committee`, `organization`].includes(data.permission_type) ||
                !Number.isInteger(data.permission_id) ||
                !Array.isArray(data.search) ||
                (data.search as any[]).some(
                    search =>
                        !search ||
                        typeof search !== `object` ||
                        Object.keys(search).some(
                            key => ![`username`, `saml_id`, `first_name`, `last_name`, `email`].includes(key)
                        )
                )
            ) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return {
                returnValue: (data.search as any[]).map(search =>
                    testUsers.filter(user => Object.keys(search).every(key => user[key] === search[key]))
                )
            };
        });
    });

    it(`should correctly call search_users`, async () => {
        expect(
            await service.call({
                permissionScope: UserScope.ORGANIZATION,
                searchCriteria: [{ username: `jd` }, { email: `john.doe@email.en` }]
            })
        ).toEqual([[testUsers[1]], [testUsers[0], testUsers[2]]]);
        expect(
            await service.call({
                searchCriteria: [{ username: `jd` }, { email: `john.doe@email.en` }]
            })
        ).toEqual([[testUsers[1]], [testUsers[0], testUsers[2]]]);
    });

    it(`should minimize search by removing duplicates`, async () => {
        expect(
            await service.call({
                permissionScope: UserScope.MEETING,
                permissionRelatedId: 4,
                searchCriteria: [
                    { username: `jd`, last_name: `Doe` },
                    { username: `jd`, last_name: `Doe` }
                ]
            })
        ).toEqual([[testUsers[1]]]);
    });

    it(`should not minimize search by removing duplicates when it's turned off`, async () => {
        expect(
            await service.call(
                {
                    permissionScope: UserScope.MEETING,
                    permissionRelatedId: 4,
                    searchCriteria: [
                        { username: `jd`, last_name: `Doe` },
                        { username: `jd`, last_name: `Doe` }
                    ]
                },
                false
            )
        ).toEqual([[testUsers[1]], [testUsers[1]]]);
    });

    it(`test callForUsers`, async () => {
        expect(
            await service.callForUsers({
                users: [testUsers[3]]
            })
        ).toEqual([[testUsers[3]]]);
    });
});
