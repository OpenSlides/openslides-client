import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import {
    MotionControllerService,
    REFERENCED_MOTION_REGEX
} from 'src/app/site/pages/meetings/pages/motions/services/common/motion-controller.service';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';

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
    private referencedMotions: Set<Id> = new Set();

    public constructor(
        protected translate: TranslateService,
        protected motionRepo: MotionControllerService,
        private auService: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService
    ) {
        super();
    }

    public addReferencedMotions(text: string): void {
        const matches = text.matchAll(REFERENCED_MOTION_REGEX);
        for (const match of matches) {
            this.referencedMotions.add(Number(match[1]));
        }
    }

    public async loadReferencedMotions(): Promise<void> {
        const load = [];
        for (const motionId of this.referencedMotions) {
            if (!this.motionRepo.getViewModel(motionId)?.getNumberOrTitle()) {
                load.push(motionId);
            }
            this.referencedMotions.delete(motionId);
        }

        if (load.length) {
            const req = await this.modelRequestBuilder.build({
                ids: load,
                viewModelCtor: ViewMotion
            });
            this.auService.single(req, `motion_slide:load_referenced_motions`);
        }
    }

    public getNumberOrTitle(titleInformation: MotionTitleInformation): string {
        return this.motionRepo.getNumberOrTitle(titleInformation as any);
    }
}
