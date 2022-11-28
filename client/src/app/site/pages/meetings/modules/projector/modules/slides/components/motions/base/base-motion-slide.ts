import { TranslateService } from '@ngx-translate/core';
import { MotionControllerService } from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { TitleInformationWithAgendaItem } from '../../../definitions';

export interface MotionTitleInformation extends TitleInformationWithAgendaItem {
    title: string;
    number: string;
}

/**
 * Format for referenced motions: A mapping of motion ids to their title information.
 */
export interface ReferencedMotions {
    [fqid: string]: MotionTitleInformation;
}

/**
 * Base slide for motions and motion blocks. This provides the functionality of
 * fetching referenced motions (format: `[motion/<id>]`) in strings.
 */
export class BaseMotionSlideComponent<T extends object> extends BaseSlideComponent<T> {
    public constructor(protected translate: TranslateService, protected motionRepo: MotionControllerService) {
        super();
    }

    public getNumberOrTitle(titleInformation: MotionTitleInformation): string {
        return this.motionRepo.getNumberOrTitle(titleInformation as any);
    }
}
