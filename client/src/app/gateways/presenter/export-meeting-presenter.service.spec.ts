import { TestBed } from '@angular/core/testing';

import { ExportMeetingPresenterService } from './export-meeting-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`ExportMeetingPresenterService`, () => {
    let service: ExportMeetingPresenterService;
    let presenter: MockPresenterService;

    const testMeeting = { name: `Some meeting` };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExportMeetingPresenterService, { provide: PresenterService, useClass: MockPresenterService }]
        });

        service = TestBed.inject(ExportMeetingPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.EXPORT_MEETING, (data?: any) => {
            if (!data || !(typeof data === `object`) || !Number.isInteger(data.meeting_id)) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            return { returnValue: { meeting: { id: data.meeting_id, ...testMeeting } } };
        });
    });

    it(`should correctly call export_meeting`, async () => {
        expect(await service.call({ meeting_id: 2 })).toEqual({ meeting: { id: 2, ...testMeeting } });
    });
});
