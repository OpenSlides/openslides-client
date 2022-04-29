import { Component, OnInit } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { map } from 'rxjs';

const POLL_LIST_SUBSCRIPTION = `poll_list`;

@Component({
    selector: 'os-poll-main',
    templateUrl: './poll-main.component.html',
    styleUrls: ['./poll-main.component.scss']
})
export class PollMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewMeeting,
                    ids: [id],
                    follow: [{ idField: `poll_ids`, fieldset: `list` }, `option_ids`, `vote_ids`]
                },
                subscriptionName: POLL_LIST_SUBSCRIPTION,
                hideWhen: this.getNextMeetingIdObservable().pipe(map(id => !id))
            });
        }
    }
}
