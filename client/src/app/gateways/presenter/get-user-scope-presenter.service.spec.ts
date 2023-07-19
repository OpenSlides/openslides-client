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

    const scopeMap = {
        2: { title: `meeting user` },
        3: { title: `committee user` },
        5: { title: `organization user` },
        6: { title: `account admin` },
        7: { title: `organization admin` },
        8: { title: `superadmin` }
    };

    function getExpectedCompareResult(key1: keyof typeof scopeMap, key2: keyof typeof scopeMap): number {
        return key1 > key2 ? 1 : -1;
    }

    const testScopes: { [key in keyof typeof scopeMap]: any } = {
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

    for (let key of Object.keys(scopeMap).map(x => +x as keyof typeof scopeMap)) {
        const otherKeys: (keyof typeof scopeMap)[] = Object.keys(scopeMap)
            .map(key => +key as keyof typeof scopeMap)
            .filter(otherKey => otherKey !== key);
        it(`test compareScope with oml comparison for ${scopeMap[key].title}`, async () => {
            expect(await service.compareScope(testScopes[key], testScopes[otherKeys[0]], true)).toBe(
                getExpectedCompareResult(key, otherKeys[0])
            );
            expect(await service.compareScope(testScopes[key], testScopes[otherKeys[1]], true)).toBe(
                getExpectedCompareResult(key, otherKeys[1])
            );
            expect(await service.compareScope(testScopes[key], testScopes[otherKeys[2]], true)).toBe(
                getExpectedCompareResult(key, otherKeys[2])
            );
            expect(await service.compareScope(testScopes[key], testScopes[otherKeys[3]], true)).toBe(
                getExpectedCompareResult(key, otherKeys[3])
            );
            expect(await service.compareScope(testScopes[key], testScopes[otherKeys[4]], true)).toBe(
                getExpectedCompareResult(key, otherKeys[4])
            );
            expect(await service.compareScope(testScopes[key], testScopes[key], true)).toBe(0);
            expect(await service.compareScope(testScopes[key], { ...testScopes[key], id: 9 }, true)).toBe(0);
        });
    }

    it(`test compareScope with default settings`, async () => {
        expect(await service.compareScope(testScopes[2], testScopes[3])).toBe(-1);
        expect(await service.compareScope(testScopes[2], testScopes[5])).toBe(-1);
        expect(await service.compareScope(testScopes[3], testScopes[5])).toBe(-1);
        expect(await service.compareScope(testScopes[3], testScopes[2])).toBe(1);
        expect(await service.compareScope(testScopes[5], testScopes[2])).toBe(1);
        expect(await service.compareScope(testScopes[5], testScopes[3])).toBe(1);
        expect(await service.compareScope(testScopes[7], testScopes[6])).toBe(0);
        expect(await service.compareScope(testScopes[6], testScopes[6])).toBe(0);
    });
});
