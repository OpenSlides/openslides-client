import { Injectable } from '@angular/core';

import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MotionCommentSection } from 'app/shared/models/motions/motion-comment-section';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
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
export class MotionCommentSectionRepositoryService extends MeetingModelBaseRepository<
    ViewMotionCommentSection,
    MotionCommentSection
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private http: HttpService) {
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

    /**
     * Saves a comment made at a MotionCommentSection. Does an update, if
     * there is a comment text. Deletes the comment, if the text is empty.
     *
     * @param motion the motion
     * @param section the section where the comment was made
     * @param sectionComment the comment text
     * @returns the promise from the HTTP request
     */
    public async saveComment(motion: ViewMotion, section: ViewMotionCommentSection, comment: string): Promise<void> {
        if (comment) {
            return await this.updateComment(motion, section, comment);
        } else {
            return await this.deleteComment(motion, section);
        }
    }

    /**
     * Updates the comment. Saves it on the server.
     */
    private async updateComment(motion: ViewMotion, section: ViewMotionCommentSection, comment: string): Promise<void> {
        return await this.http.post(`/rest/motions/motion/${motion.id}/manage_comments/`, {
            section_id: section.id,
            comment: comment
        });
    }

    /**
     * Deletes a comment from the server
     */
    private async deleteComment(motion: ViewMotion, section: ViewMotionCommentSection): Promise<void> {
        return await this.http.delete(`/rest/motions/motion/${motion.id}/manage_comments/`, { section_id: section.id });
    }

    /**
     * Sort all comment sections. All sections must be given excatly once.
     */
    public async sortCommentSections(sections: ViewMotionCommentSection[]): Promise<void> {
        return await this.http.post('/rest/motions/motion-comment-section/sort/', {
            ids: sections.map(section => section.id)
        });
    }
}
