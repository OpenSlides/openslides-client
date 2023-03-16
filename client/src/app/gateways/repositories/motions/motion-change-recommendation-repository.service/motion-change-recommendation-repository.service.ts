import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionChangeRecommendation } from 'src/app/domain/models/motions/motion-change-recommendation';
import { ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionChangeRecommendationAction } from './motion-change-recommendation.action';

@Injectable({
    providedIn: `root`
})
export class MotionChangeRecommendationRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionChangeRecommendation,
    MotionChangeRecommendation
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionChangeRecommendation);
    }

    public getTitle = () => this.getVerboseName();

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Change recommendations` : `Change recommendation`);

    public create(model: Partial<MotionChangeRecommendation>, firstLine: number = 1): Promise<Identifiable> {
        const payload = {
            internal: model.internal,
            line_from: model.line_from! - firstLine + 1,
            line_to: model.line_to! - firstLine + 1,
            motion_id: model.motion_id,
            other_description: model.other_description,
            rejected: model.rejected,
            text: model.text,
            type: model.type
        };
        return this.sendActionToBackend(MotionChangeRecommendationAction.CREATE, payload);
    }

    public update(update: any, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            internal: update.internal,
            other_description: update.other_description,
            rejected: update.rejected,
            text: update.text,
            type: update.type
        };
        return this.sendActionToBackend(MotionChangeRecommendationAction.UPDATE, payload);
    }

    public delete(viewModel: Identifiable): Promise<void> {
        return this.sendActionToBackend(MotionChangeRecommendationAction.DELETE, { id: viewModel.id });
    }
}
