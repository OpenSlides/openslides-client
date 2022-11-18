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
 * Base slide for motions and motion blocks. This Provides the functionality of
 * replacing referenced motions (format: `[motion:<id>]`) in strings.
 */
export class BaseMotionSlideComponent<T extends object> extends BaseSlideComponent<T> {
    public constructor(protected translate: TranslateService, private motionRepo: MotionControllerService) {
        super();
    }

    /**
     * Replaces all motion placeholders with the motion titles or `<unknown motion>` if the
     * referenced motion doe snot exist.
     *
     * @param text the text to replace
     * @param referencedMotions an object holding the title information for all referenced motions
     * @returns the new string
     */
    public replaceReferencedMotions(text: string, referencedMotions: ReferencedMotions): string {
        return text.replace(/\[motion:(\d+)\]/g, (_, id) => {
            const referencedMotion = referencedMotions[id];
            if (referencedMotion) {
                return this.getNumberOrTitle(referencedMotion);
            } else {
                return this.translate.instant(`<unknown motion>`);
            }
        });
    }

    public getNumberOrTitle(titleInformation: MotionTitleInformation): string {
        return this.motionRepo.getNumberOrTitle(titleInformation as any);
    }
}
