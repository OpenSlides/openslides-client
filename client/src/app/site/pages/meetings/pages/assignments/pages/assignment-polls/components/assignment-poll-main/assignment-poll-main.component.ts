import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import { getParticipantMinimalSubscriptionConfig } from '../../../../../participants/participants.subscription';
import { ViewPoll } from '../../../../../polls';
import { getPollDetailSubscriptionConfig } from '../../../../../polls/polls.subscription';

@Component({
    selector: `os-assignment-poll-main`,
    templateUrl: `./assignment-poll-main.component.html`,
    styleUrls: [`./assignment-poll-main.component.scss`]
})
export class AssignmentPollMainComponent extends BaseModelRequestHandlerComponent {
    public constructor(private sequentialNumberMappingService: SequentialNumberMappingService) {
        super();
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] && params[`id`] !== oldParams[`id`]) {
            this.sequentialNumberMappingService
                .getIdBySequentialNumber({
                    collection: ViewPoll.COLLECTION,
                    meetingId: params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id) {
                        this.subscribeTo(getPollDetailSubscriptionConfig(id), { hideWhenDestroyed: true });
                        this.subscribeTo(getParticipantMinimalSubscriptionConfig(+params[`meetingId`]), {
                            hideWhenDestroyed: true
                        });
                    }
                });
        }
    }
}
