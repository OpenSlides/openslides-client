import { TestBed } from '@angular/core/testing';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { UserScope } from 'src/app/site/services/user.service';

import { GetUserScopePresenterService } from './get-user-scope-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`GetUserScopePresenterService`, () => {
    let service: GetUserScopePresenterService;
    let presenter: MockPresenterService;

    const testScopes: Record<number, any> = {
        2: {
            collection: UserScope.MEETING,
            id: 2,
            user_oml: ``
        },
        3: {
            collection: UserScope.COMMITTEE,
            id: 3,
            user_oml: ``
        },
        5: {
            collection: UserScope.ORGANIZATION,
            id: 5,
            user_oml: ``
        },
        6: {
            collection: UserScope.ORGANIZATION,
            id: 6,
            user_oml: OML.can_manage_users
        },
        7: {
            collection: UserScope.ORGANIZATION,
            id: 7,
            user_oml: OML.can_manage_organization
        },
        8: {
            collection: UserScope.ORGANIZATION,
            id: 8,
            user_oml: OML.superadmin
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GetUserScopePresenterService, { provide: PresenterService, useClass: MockPresenterService }]
        });

        service = TestBed.inject(GetUserScopePresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.GET_USER_SCOPE, (data?: any) => {
            if (
                !data ||
                !(typeof data === `object`) ||
                Object.keys(data).length !== 1 ||
                !Array.isArray(data.user_ids) ||
                (data.user_ids as any[]).some(id => !Number.isInteger(id) || id < 1)
            ) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return { returnValue: testScopes };
        });
    });

    it(`should correctly call get_user_scope`, async () => {
        expect(await service.call({ user_ids: [2, 3, 5, 6, 7, 8] })).toEqual(testScopes);
    });
});
