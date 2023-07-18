import { TestBed } from '@angular/core/testing';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';

import {
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsPresenterService
} from './get-user-related-models-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`GetUserRelatedModelsPresenterService`, () => {
    let service: GetUserRelatedModelsPresenterService;
    let presenter: MockPresenterService;

    const testUsers: GetUserRelatedModelsPresenterResult = {
        2: {
            organization_management_level: OML.superadmin,
            meetings: [
                {
                    id: 2,
                    is_active_in_organization_id: 1,
                    name: `Meeting 2`,
                    assignment_candidate_ids: [3, 5],
                    speaker_ids: [5, 6],
                    motion_submitter_ids: [7, 8]
                }
            ],
            committees: [{ id: 10, name: `Committee 10`, cml: CML.can_manage }]
        },
        3: {
            meetings: [
                {
                    id: 5,
                    is_active_in_organization_id: 1,
                    name: `Meeting 5`,
                    assignment_candidate_ids: [42],
                    speaker_ids: [6, 42],
                    motion_submitter_ids: [3, 7]
                }
            ],
            committees: [{ id: 3, name: `Committee 3`, cml: `` }]
        },
        5: {}
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GetUserRelatedModelsPresenterService,
                { provide: PresenterService, useClass: MockPresenterService }
            ]
        });

        service = TestBed.inject(GetUserRelatedModelsPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.GET_USER_RELATED_MODELS, (data?: any) => {
            if (
                !data ||
                !(typeof data === `object`) ||
                Object.keys(data).length !== 1 ||
                !Array.isArray(data.user_ids) ||
                (data.user_ids as any[]).some(id => !Number.isInteger(id) || id < 1)
            ) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return { returnValue: testUsers };
        });
    });

    it(`should correctly call get_user_related_models`, async () => {
        expect(await service.call({ user_ids: [2, 3, 5] })).toEqual(testUsers);
    });
});
