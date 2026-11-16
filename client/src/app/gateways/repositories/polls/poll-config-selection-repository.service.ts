import { Injectable } from '@angular/core';
import { PollConfigSelection } from '@app/domain/models/poll/poll-config-selection';
import { ViewPollConfigSelection } from '@app/site/pages/meetings/pages/polls/view-models/poll-config-selection';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollConfigSelectionRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigSelection,
    PollConfigSelection
> {
    protected baseModelCtor = PollConfigSelection;

    public getTitle = (_viewPollConfigSelection: ViewPollConfigSelection): string => `Selection poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Selection poll configs` : `Selection poll config`);
}
