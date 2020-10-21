import { Injectable } from '@angular/core';

import { MotionCommentSectionAction } from 'app/core/actions/motion-comment-section-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionCommentSection } from 'app/shared/models/motions/motion-comment-section';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for Categories
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionCommentSectionRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionCommentSection);

        this.viewModelSortFn = (a: ViewMotionCommentSection, b: ViewMotionCommentSection) => {
            if (a.weight === b.weight) {
                return a.id - b.id;
            } else {
                return a.weight - b.weight;
            }
        };
    }

    public getFieldsets(): Fieldsets<ViewMotionCommentSection> {
        const listFields: (keyof ViewMotionCommentSection)[] = ['name', 'weight'];
        const commentFields: (keyof ViewMotionCommentSection)[] = ['name', 'read_group_ids', 'write_group_ids'];
        return {
            [DEFAULT_FIELDSET]: listFields,
            comment: commentFields
        };
    }

    public getTitle = (viewMotionCommentSection: ViewMotionCommentSection) => {
        return viewMotionCommentSection.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Comment sections' : 'Comment section');
    };

    public async create(partialModel: Partial<MotionCommentSection>): Promise<Identifiable> {
        const payload: MotionCommentSectionAction.CreatePayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            name: partialModel.name,
            read_group_ids: partialModel.read_group_ids,
            write_group_ids: partialModel.write_group_ids
        };
        return this.sendActionToBackend(MotionCommentSectionAction.CREATE, payload);
    }

    public async update(update: Partial<ViewMotionCommentSection>, viewModel: ViewMotionCommentSection): Promise<void> {
        const payload: MotionCommentSectionAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            read_group_ids: update.read_group_ids,
            write_group_ids: update.write_group_ids
        };
        return this.sendActionToBackend(MotionCommentSectionAction.UPDATE, payload);
    }

    public async delete(viewModel: ViewMotionCommentSection): Promise<void> {
        return this.sendActionToBackend(MotionCommentSectionAction.DELETE, { id: viewModel.id });
    }

    /**
     * Sort all comment sections. All sections must be given excatly once.
     */
    public async sortCommentSections(sections: ViewMotionCommentSection[]): Promise<void> {
        const payload: MotionCommentSectionAction.SortPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            motion_comment_section_ids: sections.map(section => section.id)
        };
        return this.actions.sendRequest(MotionCommentSectionAction.SORT, payload);
    }
}
