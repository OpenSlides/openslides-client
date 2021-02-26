import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Id } from 'app/core/definitions/key-types';
import { DiffLinesInParagraph } from 'app/core/ui-services/diff.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { SearchProperty, SearchRepresentation } from 'app/core/ui-services/search.service';
import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { HasReferencedMotionInRecommendationExtensionIds, Motion } from 'app/shared/models/motions/motion';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { HasAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { Searchable } from 'app/site/base/searchable';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { HasAttachment } from 'app/site/mediafiles/models/view-mediafile';
import { HasTags } from 'app/site/tags/models/view-tag';
import { HasPersonalNote, ViewPersonalNote } from 'app/site/users/models/view-personal-note';
import { ViewUser } from 'app/site/users/models/view-user';
import { AmendmentType } from '../motions.constants';
import { ViewMotionBlock } from './view-motion-block';
import { ViewMotionCategory } from './view-motion-category';
import { ViewMotionChangeRecommendation } from './view-motion-change-recommendation';
import { ViewMotionComment } from './view-motion-comment';
import { ViewMotionCommentSection } from './view-motion-comment-section';
import { ViewMotionPoll } from './view-motion-poll';
import { ViewMotionState } from './view-motion-state';
import { ViewMotionStatuteParagraph } from './view-motion-statute-paragraph';
import { ViewMotionSubmitter } from './view-motion-submitter';

export interface HasReferencedMotionsInRecommendationExtension extends HasReferencedMotionInRecommendationExtensionIds {
    referenced_in_motion_recommendation_extension: ViewMotion[];
}

/**
 * Motion class for the View
 *
 * Stores a motion including all (implicit) references
 * Provides "safe" access to variables and functions in {@link Motion}
 * @ignore
 */
export class ViewMotion extends BaseProjectableViewModel<Motion> {
    public static COLLECTION = Motion.COLLECTION;
    protected _collection = Motion.COLLECTION;

    public get motion(): Motion {
        return this._model;
    }

    public get submittersAsUsers(): ViewUser[] {
        return (this.submitters || []).map(submitter => submitter.user);
    }

    public get numberOrTitle(): string {
        return this.number ? this.number : this.title;
    }

    public get agenda_type(): AgendaItemType | null {
        return this.agenda_item ? this.agenda_item.type : null;
    }

    public get speakerAmount(): number | null {
        return this.list_of_speakers ? this.list_of_speakers.waitingSpeakerAmount : null;
    }

    /**
     * @returns the creation date as Date object
     */
    public get creationDate(): Date {
        if (!this.motion.created) {
            return null;
        }
        return new Date(this.motion.created);
    }

    /**
     * @returns the date of the last change as Date object, null if empty
     */
    public get lastChangeDate(): Date {
        if (!this.motion.last_modified) {
            return null;
        }
        return new Date(this.motion.last_modified);
    }

    /**
     * @returns the current state extension if the workwlof allows for extenstion fields
     */
    public get stateExtension(): string {
        if (this.state && this.state.show_state_extension_field) {
            return this.motion.state_extension;
        } else {
            return null;
        }
    }

    /**
     * @returns the current recommendation extension if the workflow allows for extenstion fields
     */
    public get recommendationExtension(): string {
        if (this.recommendation && this.recommendation.show_recommendation_extension_field) {
            return this.motion.recommendation_extension;
        } else {
            return null;
        }
    }

    /**
     * Gets the comments' section ids of a motion. Used in filter by motionComment
     *
     * @returns an array of ids, or an empty array
     */
    public get usedCommentSectionIds(): Id[] {
        if (!this.motion) {
            return [];
        }
        return this.comments
            .map(comment => comment.section_id)
            .filter((value, index, self) => self.indexOf(value) === index);
    }

    public get hasSpeakers(): boolean {
        return this.speakerAmount > 0;
    }

    public get showPreamble(): boolean {
        return !this.state?.isFinalState ?? true;
    }

    /**
     * Translate the state's css class into a color
     *
     * @returns a string representing a color
     */
    public get stateCssColor(): string {
        return this.state ? this.state.css_class : '';
    }

    /**
     * Determine if a motion has a parent at all
     */
    public get hasLeadMotion(): boolean {
        return !!this.lead_motion_id;
    }

    /**
     * Determine if a motion has amenments
     */
    public get hasAmendments(): boolean {
        return !!this.amendments && !!this.amendments.length;
    }

    /**
     * Determine if the motion has parents, is a parent or neither
     */
    public get amendmentType(): AmendmentType {
        if (this.hasLeadMotion) {
            return AmendmentType.Amendment;
        } else if (this.hasAmendments) {
            return AmendmentType.Parent;
        } else {
            return AmendmentType.Lead;
        }
    }

    public get diffLines(): DiffLinesInParagraph[] | null {
        return this.getAmendmentParagraphLines();
    }

    /**
     * Get the number of the first diff line, in case a motion is an amendment
     */
    public get parentAndLineNumber(): string | null {
        if (this.isParagraphBasedAmendment() && this.lead_motion && this.diffLines && this.diffLines.length) {
            return `${this.lead_motion.number} ${this.diffLines[0].diffLineFrom}`;
        } else {
            return null;
        }
    }

    /**
     * This is injected. Do NOT use: Use `get diffLines()` instead.
     */
    public getAmendmentParagraphLines: () => DiffLinesInParagraph[] | null;
    public getParagraphTitleByParagraph: (paragraph: DiffLinesInParagraph) => string | null;
    // This is set by the repository
    public getNumberOrTitle: () => string;

    public getPersonalNote(): ViewPersonalNote | null {
        if (this.personal_notes?.length) {
            return this.personal_notes[0] || null;
        }
    }

    /**
     * Extract the lines of the amendments
     * If an amendments has multiple changes, they will be printed like an array of strings
     *
     * @return The lines of the amendment
     */
    public getChangeLines(): string {
        if (this.diffLines) {
            return this.diffLines
                .map(diffLine => {
                    if (diffLine.diffLineTo === diffLine.diffLineFrom + 1) {
                        return '' + diffLine.diffLineFrom;
                    } else {
                        return `${diffLine.diffLineFrom} - ${diffLine.diffLineTo - 1}`;
                    }
                })
                .toString();
        }
    }

    /**
     * Formats the category for search
     *
     * @override
     */
    public formatForSearch(): SearchRepresentation {
        const properties: SearchProperty[] = [];
        properties.push({ key: 'Title', value: this.getTitle() });
        properties.push({ key: 'Submitters', value: this.submittersAsUsers.map(user => user.full_name).join(', ') });
        properties.push({ key: 'Text', value: this.text, trusted: true });
        properties.push({ key: 'Reason', value: this.reason, trusted: true });
        if (this.amendment_paragraph_$?.length) {
            properties.push({
                key: 'Amendments',
                value: this.amendment_paragraph_$.map(paraNo => this.amendment_paragraph(paraNo)).join('\n'),
                trusted: true
            });
        }
        properties.push({ key: 'Tags', value: this.tags.map(tag => tag.getTitle()).join(', ') });
        properties.push({
            key: 'Comments',
            value: this.comments.map(comment => comment.comment).join('\n'),
            trusted: true
        });
        properties.push({ key: 'Supporters', value: this.supporters.map(user => user.full_name).join(', ') });

        // A property with block-value to unify the meta-info.
        const metaData: SearchProperty = {
            key: null,
            value: null,
            blockProperties: []
        };
        if (this.block) {
            metaData.blockProperties.push({ key: 'Motion block', value: this.block.getTitle() });
        }
        if (this.category) {
            metaData.blockProperties.push({ key: 'Category', value: this.category.getTitle() });
        }
        if (this.state) {
            metaData.blockProperties.push({ key: 'State', value: this.state.name });
        }

        properties.push(metaData);

        return {
            properties,
            searchValue: properties.map(property =>
                property.key ? property.value : property.blockProperties.join(',')
            )
        };
    }

    public getDetailStateURL(): string {
        return `/motions/${this.id}`;
    }

    /**
     * Returns the motion comment for the given section. Null, if no comment exist.
     *
     * @param section The section to search the comment for.
     */
    public getCommentForSection(section: ViewMotionCommentSection): ViewMotionComment {
        return this.comments.find(comment => comment.section_id === section.id);
    }

    public hasSupporters(): boolean {
        return true;
        // return !!(this.supporters && this.supporters.length > 0);
    }

    public hasAttachments(): boolean {
        return !!(this.attachments && this.attachments.length > 0);
    }

    public hasTags(): boolean {
        return !!(this.tags && this.tags.length > 0);
    }

    public isStatuteAmendment(): boolean {
        return !!this.statute_paragraph_id;
    }

    /**
     * Determine if the motion is in its final workflow state
     */
    public isInFinalState(): boolean {
        return this.state ? this.state.isFinalState : false;
    }

    /**
     * It's a paragraph-based amendments if only one paragraph is to be changed,
     * specified by -array
     */
    public isParagraphBasedAmendment(): boolean {
        return this.amendment_paragraph_$?.length > 0;
    }

    public getProjectionBuildDescriptor(meetingSettingsService: MeetingSettingsService): ProjectionBuildDescriptor {
        const slideOptions = [];
        if (
            (this.change_recommendations && this.change_recommendations.length) ||
            (this.amendments && this.amendments.length)
        ) {
            slideOptions.push({
                key: 'mode',
                displayName: _('Which version?'),
                default: meetingSettingsService.instant('motions_recommendation_text_mode'),
                choices: [
                    { value: 'original', displayName: 'Original version' },
                    { value: 'changed', displayName: 'Changed version' },
                    { value: 'diff', displayName: 'Diff version' },
                    { value: 'agreed', displayName: 'Final version' }
                ]
            });
        }

        return {
            content_object_id: this.fqid,
            slideOptions: slideOptions,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getAgendaSlideTitle
        };
    }

    public getProjectiondefault(): Projectiondefault {
        if (this.isParagraphBasedAmendment()) {
            return Projectiondefault.amendment;
        } else {
            return Projectiondefault.motion;
        }
    }
}

interface IMotionRelations {
    lead_motion?: ViewMotion;
    amendments: ViewMotion[]; // children to lead_motion
    sort_parent?: ViewMotion;
    sort_children: ViewMotion[];
    origin?: ViewMotion;
    derived_motions: ViewMotion[];
    forwarding_tree_motions: ViewMotion[];
    state?: ViewMotionState;
    recommendation?: ViewMotionState;
    recommendation_extension_reference: (BaseViewModel & HasReferencedMotionsInRecommendationExtension)[];
    category?: ViewMotionCategory;
    block?: ViewMotionBlock;
    submitters: ViewMotionSubmitter[];
    supporters: ViewUser[];
    polls: ViewMotionPoll[];
    change_recommendations: ViewMotionChangeRecommendation[];
    statute_paragraph?: ViewMotionStatuteParagraph;
    comments: ViewMotionComment[];
}

export interface ViewMotion
    extends Motion,
        IMotionRelations,
        Searchable,
        HasMeeting,
        HasAttachment,
        HasPersonalNote,
        HasTags,
        HasAgendaItem,
        HasListOfSpeakers,
        HasReferencedMotionsInRecommendationExtension {}
