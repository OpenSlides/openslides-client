import { Directive } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';
import { BaseModelRequestHandlerComponent } from '@app/site/base/base-model-request-handler.component';

@Directive()
export abstract class BaseMeetingModelRequestHandler extends BaseModelRequestHandlerComponent {
    protected abstract getSubscriptions(meetingId: Id): SubscriptionConfig<any>[];

    protected override onShouldCreateModelRequests(_params: any, id: number | null): void {
        if (id) {
            this.subscribeTo(this.getSubscriptions(id), { hideWhenMeetingChanged: true });
        }
    }

    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.updateSubscribeTo(this.getSubscriptions(id), { hideWhenMeetingChanged: true });
        }
    }
}
