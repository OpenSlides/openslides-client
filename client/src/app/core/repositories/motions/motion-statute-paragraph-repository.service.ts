import { Injectable } from '@angular/core';

import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { ActionType } from 'app/core/core-services/action.service';
import { MotionStatuteParagraphAction } from 'app/core/actions/motion-statue-paragraph-action';
import { Identifiable } from 'app/shared/models/base/identifiable';

/**
 * Repository Services for statute paragraphs
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionStatuteParagraphRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionStatuteParagraph);
    }

    public getTitle = (viewMotionStatuteParagraph: ViewMotionStatuteParagraph) => {
        return viewMotionStatuteParagraph.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Statute paragraphs' : 'Statute paragraph');
    };
    public create(statuteParagraph: Partial<MotionStatuteParagraph>): Promise<Identifiable> {
        const payload: MotionStatuteParagraphAction.CreatePayload = {
            meeting_id: this.activeMeetingService.meetingId,
            title: statuteParagraph.title,
            text: statuteParagraph.text
        };
        return this.sendActionToBackend(ActionType.MOTION_STATUTE_PARAGRAPH_CREATE, payload);
    }

    public update(update: Partial<MotionStatuteParagraph>, viewModel: ViewMotionStatuteParagraph): Promise<void> {
        const payload: MotionStatuteParagraphAction.UpdatePayload = {
            id: viewModel.id,
            title: update.title,
            text: update.text
        };
        return this.sendActionToBackend(ActionType.MOTION_STATUTE_PARAGRAPH_UPDATE, payload);
    }

    public delete(viewModel: ViewMotionStatuteParagraph): Promise<void> {
        const payload: MotionStatuteParagraphAction.DeletePayload = {
            id: viewModel.id,

        };
        return this.sendActionToBackend(ActionType.MOTION_STATUTE_PARAGRAPH_DELETE, payload);
    }
}
