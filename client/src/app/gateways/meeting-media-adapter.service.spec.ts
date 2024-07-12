import { TestBed } from '@angular/core/testing';

import { FONT_PLACES, LOGO_PLACES } from '../domain/models/mediafiles/mediafile.constants';
import { ViewMediafile } from '../site/pages/meetings/pages/mediafiles';
import { ActionService } from './actions/action.service';
import { ActionRequest } from './actions/action-utils';
import { MeetingMediaAdapterService } from './meeting-media-adapter.service';
import { MeetingAction } from './repositories/meetings';

class MockAction<T> {
    public constructor(public requests: ActionRequest[], public handle_separately: boolean) {}

    public async resolve(): Promise<T[] | void> {
        return;
    }
}

class MockActionService {
    public lastActions: MockAction<unknown>[] = [];
    public constructor() {}

    public createFromArray<T>(requests: ActionRequest[], handle_separately = false): MockAction<T> {
        const action = new MockAction<T>(requests, handle_separately);
        this.lastActions.push(action);
        return action;
    }
}

describe(`MeetingMediaAdapterService`, () => {
    let service: MeetingMediaAdapterService;
    let actionService: MockActionService;

    const mediafile = { meeting_id: 2, id: 42 } as ViewMediafile;

    const testCases = [
        {
            functionName: `setLogo`,
            place: LOGO_PLACES[0],
            restPayload: mediafile,
            expectedAction: MeetingAction.SET_LOGO,
            expectedData: { id: 2, mediafile_id: 42 }
        },
        {
            functionName: `unsetLogo`,
            place: LOGO_PLACES[1 % LOGO_PLACES.length],
            restPayload: 1,
            expectedAction: MeetingAction.UNSET_LOGO,
            expectedData: { id: 1 }
        },
        {
            functionName: `setFont`,
            place: FONT_PLACES[2 % FONT_PLACES.length],
            restPayload: mediafile,
            expectedAction: MeetingAction.SET_FONT,
            expectedData: { id: 2, mediafile_id: 42 }
        },
        {
            functionName: `unsetFont`,
            place: FONT_PLACES[3 % FONT_PLACES.length],
            restPayload: 123,
            expectedAction: MeetingAction.UNSET_FONT,
            expectedData: { id: 123 }
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MeetingMediaAdapterService, { provide: ActionService, useClass: MockActionService }]
        });

        service = TestBed.inject(MeetingMediaAdapterService);
        actionService = TestBed.inject(ActionService) as unknown as MockActionService;
    });

    for (const test of testCases) {
        it(`test ${test.functionName} function`, async () => {
            await expectAsync(service[test.functionName](test.place, test.restPayload)).toBeResolved();
            expect(actionService.lastActions.length).toBe(1);
            expect(actionService.lastActions[0].requests).toEqual([
                { action: test.expectedAction, data: [{ ...test.expectedData, place: test.place }] }
            ]);
        });
    }
});
