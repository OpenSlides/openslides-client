import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const MEETING_DETAIL_EDIT_SUBSCRIPTION = `meeting_detail_edit`; // Used for editing within a committee

@Component({
    selector: `os-committee-detail-meeting-main`,
    templateUrl: `./committee-detail-meeting-main.component.html`,
    styleUrls: [`./committee-detail-meeting-main.component.scss`]
})
export class CommitteeDetailMeetingMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any): void {
        if (params[`meetingId`]) {
            this.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewMeeting,
                    ids: [Number(params[`meetingId`])],
                    fieldset: [],
                    additionalFields: [
                        `is_template`,
                        `default_meeting_for_committee_id`,
                        `jitsi_domain`,
                        `jitsi_room_name`,
                        `jitsi_room_password`
                    ],
                    follow: [`admin_group_id`, `default_group_id`]
                },
                subscriptionName: MEETING_DETAIL_EDIT_SUBSCRIPTION,
                hideWhenDestroyed: true
            });
        }
    }
}
