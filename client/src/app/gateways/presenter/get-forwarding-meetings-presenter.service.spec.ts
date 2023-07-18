import { TestBed } from '@angular/core/testing';

import { GetForwardingMeetingsPresenterService } from './get-forwarding-meetings-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`GetForwardingMeetingsPresenterService`, () => {
    let service: GetForwardingMeetingsPresenterService;
    let presenter: MockPresenterService;

    const testCommittees = [
        {
            id: 2,
            name: `Committee 2`,
            default_meeting_id: 3,
            meeting: [{ id: 3, name: `Meeting 3`, start_time: 0, end_time: 1321006271 }]
        },
        {
            id: 3,
            name: `Committee 3`,
            meeting: []
        },
        {
            id: 5,
            name: `Committee 5`,
            default_meeting_id: 4,
            meeting: [
                { id: 4, name: `Meeting 4`, start_time: 1321006271, end_time: 1352628671 },
                { id: 5, name: `Meeting 5`, start_time: 1352628671, end_time: 1636625471 }
            ]
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GetForwardingMeetingsPresenterService,
                { provide: PresenterService, useClass: MockPresenterService }
            ]
        });

        service = TestBed.inject(GetForwardingMeetingsPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.GET_FORWARDING_MEETINGS, (data?: any) => {
            if (!data || !(typeof data === `object`) || !Number.isInteger(data.meeting_id)) {
                return { error: `data had wrong format` };
            }
            return { returnValue: testCommittees };
        });
    });

    it(`should correctly call export_meeting`, async () => {
        expect(await service.call({ meeting_id: 2 })).toEqual(testCommittees);
    });
});
