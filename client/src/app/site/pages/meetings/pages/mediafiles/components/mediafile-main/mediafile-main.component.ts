import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';

import { BaseMeetingModelRequestHandler } from '../../../../base/base-meeting-model-request-handler.component';
import { getMediafilesSubscriptionConfig } from '../../mediafiles.subscription';

@Component({
    selector: `os-mediafile-main`,
    templateUrl: `./mediafile-main.component.html`,
    styleUrls: [`./mediafile-main.component.scss`]
})
export class MediafileMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        console.log(`lalalalalalalala`);
        return [getMediafilesSubscriptionConfig(id)];
    }
}
