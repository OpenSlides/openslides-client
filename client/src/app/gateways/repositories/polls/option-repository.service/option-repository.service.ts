import { Injectable } from '@angular/core';
import { Option } from 'src/app/domain/models/poll/option';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class OptionRepositoryService extends BaseMeetingRelatedRepository<ViewOption, Option> {
    public constructor() {
        super(Option);
    }

    public getTitle = (_viewOption: ViewOption): string => `Option`;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Options` : `Option`);
}
