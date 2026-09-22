import { Injectable } from '@angular/core';
import { PollOption } from '@app/domain/models/poll/poll-option';
import { ViewPollOption } from '@app/site/pages/meetings/pages/polls/view-models/poll-option';
import { ViewMeetingUser } from '@app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { _ } from '@ngx-translate/core';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollOptionRepositoryService extends BaseMeetingRelatedRepository<ViewPollOption, PollOption> {
    protected baseModelCtor = PollOption;

    public getTitle = (viewPollOption: ViewPollOption): string =>
        viewPollOption.content_object_id
            ? ((viewPollOption.content_object as ViewMeetingUser)?.user?.getShortName() ??
              (viewPollOption.content_object as ViewUser)?.getShortName())
            : viewPollOption.text;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? _(`Poll options`) : _(`Poll option`));
}
