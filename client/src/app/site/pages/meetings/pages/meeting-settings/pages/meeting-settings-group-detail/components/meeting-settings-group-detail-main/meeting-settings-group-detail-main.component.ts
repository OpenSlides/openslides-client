import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMotionWorkflowSubscriptionConfig } from '../../../../../motions/motions.subscription';

const MOTIONS_SETTINGS_GROUP = `motions`;

@Component({
    selector: `os-meeting-settings-group-detail-main`,
    templateUrl: `./meeting-settings-group-detail-main.component.html`,
    styleUrls: [`./meeting-settings-group-detail-main.component.scss`],
    standalone: false
})
export class MeetingSettingsGroupDetailMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (
            params[`group`] &&
            params[`group`] === MOTIONS_SETTINGS_GROUP &&
            params[`meetingId`] !== oldParams[`meetingId`]
        ) {
            this.updateSubscribeTo(getMotionWorkflowSubscriptionConfig(+params[`meetingId`]), {
                hideWhenMeetingChanged: true
            });
        }
    }

    protected override onShouldCreateModelRequests(params?: any, meetingId?: number): void {
        if (params[`group`] && params[`group`] === MOTIONS_SETTINGS_GROUP && meetingId) {
            this.subscribeTo(getMotionWorkflowSubscriptionConfig(meetingId), {
                hideWhenMeetingChanged: true
            });
        }
    }
}
