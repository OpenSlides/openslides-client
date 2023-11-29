import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionCommentSection } from 'src/app/domain/models/motions/motion-comment-section';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionCommentSectionAction } from './motion-comment-section.action';

@Injectable({
    providedIn: `root`
})
export class MotionCommentSectionRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionCommentSection);

        this.viewModelSortFn = (a: ViewMotionCommentSection, b: ViewMotionCommentSection) => {
            if (a.weight === b.weight) {
                return a.id - b.id;
            } else {
                return a.weight - b.weight;
            }
        };
    }

    public getTitle = (viewMotionCommentSection: ViewMotionCommentSection) => viewMotionCommentSection.name;

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Comment sections` : `Comment section`);

    public async create(partialModel: Partial<MotionCommentSection>): Promise<Identifiable> {
        const payload = {
            meeting_id: this.activeMeetingId,
            name: partialModel.name,
            read_group_ids: partialModel.read_group_ids,
            write_group_ids: partialModel.write_group_ids,
            submitter_can_write: partialModel.submitter_can_write
        };
        return this.sendActionToBackend(MotionCommentSectionAction.CREATE, payload);
    }

    public async update(update: Partial<ViewMotionCommentSection>, viewModel: ViewMotionCommentSection): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            read_group_ids: update.read_group_ids,
            write_group_ids: update.write_group_ids,
            submitter_can_write: update.submitter_can_write
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
        const payload = {
            meeting_id: this.activeMeetingId,
            motion_comment_section_ids: sections.map(section => section.id)
        };
        await this.createAction(MotionCommentSectionAction.SORT, payload).resolve();
    }
}
