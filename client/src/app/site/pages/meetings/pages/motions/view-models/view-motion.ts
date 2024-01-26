import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';

import { Id } from '../../../../../../domain/definitions/key-types';
import { AgendaItemType } from '../../../../../../domain/models/agenda/agenda-item';
import { HasReferencedMotionInExtensionIds, Motion } from '../../../../../../domain/models/motions/motion';
import { AmendmentType, ChangeRecoMode } from '../../../../../../domain/models/motions/motions.constants';
import {
    PROJECTIONDEFAULT,
    ProjectiondefaultValue
} from '../../../../../../domain/models/projector/projection-default';
import { BaseViewModel } from '../../../../../base/base-view-model';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { SlideOptions } from '../../../view-models/slide-options';
import { ViewMeeting } from '../../../view-models/view-meeting';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { ViewUser } from '../../../view-models/view-user';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { HasAgendaItem } from '../../agenda/view-models/has-agenda-item';
import { HasAttachment } from '../../mediafiles/view-models/has-attachment';
import { HasPolls, VotingTextContext } from '../../polls';
import { DiffLinesInParagraph } from '../definitions';
import { ViewMotionChangeRecommendation, ViewMotionStatuteParagraph, ViewMotionWorkflow } from '../modules';
import { ViewMotionCategory } from '../modules/categories/view-models/view-motion-category';
import { ViewMotionComment } from '../modules/comments/view-models/view-motion-comment';
import { ViewMotionCommentSection } from '../modules/comments/view-models/view-motion-comment-section';
import { ViewMotionBlock } from '../modules/motion-blocks/view-models/view-motion-block';
import { HasPersonalNote } from '../modules/personal-notes/view-models/has-personal-note';
import { ViewPersonalNote } from '../modules/personal-notes/view-models/view-personal-note';
import { ViewMotionState } from '../modules/states/view-models/view-motion-state';
import { ViewMotionSubmitter } from '../modules/submitters';
import { HasTags } from '../modules/tags/view-models/has-tags';

export interface HasReferencedMotionsInExtension extends HasReferencedMotionInExtensionIds {
    referenced_in_motion_state_extensions: ViewMotion[];
    referenced_in_motion_recommendation_extensions: ViewMotion[];
}

export enum ForwardingStatus {
    none = `none`,
    isDerived = `isDerived`,
    wasForwarded = `wasForwarded`,
    both = `both`
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

    public get workflow_id(): Id | null {
        return this.state?.workflow_id || null;
    }

    public get workflow(): ViewMotionWorkflow | null {
        return this.state?.workflow || null;
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

    public get speakerAmount(): number {
        return this.list_of_speakers?.waitingSpeakerAmount ?? 0;
    }

    /**
     * Necessary for motion filters
     */
    public get isFavorite(): boolean {
        return this.getPersonalNote()?.star || false;
    }

    /**
     * Necessary for motion filters
     */
    public get hasNotes(): boolean {
        return !!this.getPersonalNote()?.note;
    }

    /**
     * @returns the current state extension if the workwlof allows for extenstion fields
     */
    public get stateExtension(): string | null {
        if (this.state && this.state.show_state_extension_field) {
            return this.motion.state_extension;
        } else {
            return null;
        }
    }

    /**
     * @returns the current recommendation extension if the workflow allows for extenstion fields
     */
    public get recommendationExtension(): string | null {
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
        return this.state ? this.state.css_class : ``;
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

    public get changedAmendmentLines(): DiffLinesInParagraph[] | null {
        if (!this._changedAmendmentLines) {
            this._changedAmendmentLines = this.getAmendmentParagraphLines(ChangeRecoMode.Changed);
        }
        return this._changedAmendmentLines;
    }

    public get affectedAmendmentLines(): DiffLinesInParagraph[] | null {
        if (!this._affectedAmendmentLines) {
            this._affectedAmendmentLines = this.getAmendmentParagraphLines(ChangeRecoMode.Changed);
        }
        return this._affectedAmendmentLines;
    }

    /**
     * Get the number of the first diff line, in case a motion is an amendment
     */
    public get parentAndLineNumber(): string | null {
        if (this.isParagraphBasedAmendment() && this.lead_motion && this.changedAmendmentLines?.length) {
            return `${this.lead_motion.number} ${this.changedAmendmentLines[0].diffLineFrom}`;
        } else {
            return null;
        }
    }

    public get forwardingStatus(): ForwardingStatus {
        let status = ForwardingStatus.none;
        if (!!this.origin_id || !!this.origin_meeting_id) {
            status = ForwardingStatus.isDerived;
        }
        if (!!this.derived_motion_ids?.length) {
            return status === ForwardingStatus.none ? ForwardingStatus.wasForwarded : ForwardingStatus.both;
        }
        return status;
    }

    public get supporter_users(): ViewUser[] {
        return this.supporter_meeting_users?.flatMap(user => user.user ?? []);
    }

    public get supporter_user_ids(): number[] {
        return this.supporter_meeting_users?.flatMap(user => user.user_id ?? []);
    }

    private _changedAmendmentLines: DiffLinesInParagraph[] | null = null;
    private _affectedAmendmentLines: DiffLinesInParagraph[] | null = null;

    public getVotingText(context: VotingTextContext<ViewMotion>): string {
        const motionTranslation = context.translateFn(`Motion`);
        const votingOpenedTranslation = context.translateFn(`Voting opened`);
        return `${motionTranslation} ${this.getNumberOrTitle()}: ${votingOpenedTranslation}`;
    }

    /**
     * @warning This is injected. Do not use it!
     */
    public getAmendmentParagraphLines: (
        recoMode: ChangeRecoMode,
        includeUnchanged?: boolean
    ) => DiffLinesInParagraph[] = () => [];

    public getParagraphTitleByParagraph!: (paragraph: DiffLinesInParagraph) => string | null;
    // This is set by the repository
    public getNumberOrTitle!: () => string;
    public getExtendedStateLabel!: () => string;
    public getExtendedRecommendationLabel!: () => string;

    public getPersonalNote(): ViewPersonalNote | null {
        if (this.personal_notes?.length) {
            return this.personal_notes[0] || null;
        }
        return null;
    }

    /**
     * Extract the lines of the amendments
     * If an amendments has multiple changes, they will be printed like an array of strings
     *
     * @return The lines of the amendment
     */
    public getChangedLines(): string | null {
        if (this.changedAmendmentLines?.length) {
            return this.changedAmendmentLines
                .map(diffLine => {
                    if (diffLine.diffLineTo === diffLine.diffLineFrom) {
                        return `` + diffLine.diffLineFrom;
                    } else {
                        return `${diffLine.diffLineFrom} - ${diffLine.diffLineTo}`;
                    }
                })
                .toString();
        }
        return null;
    }

    public override getDetailStateUrl(): string {
        return `/${this.meeting_id ?? this.getActiveMeetingId()}/motions/${this.sequential_number}`;
    }

    /**
     * Returns the motion comment for the given section. Null, if no comment exist.
     *
     * @param section The section to search the comment for.
     */
    public getCommentForSection(section: ViewMotionCommentSection): ViewMotionComment | undefined {
        return this.comments.find(comment => comment.section_id === section.id);
    }

    public hasSupporters(): boolean {
        return !!(this.supporter_meeting_users && this.supporter_meeting_users.length > 0);
    }

    public hasAttachments(): boolean {
        return this.attachment_ids?.length > 0;
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
        return this.amendment_paragraph_numbers?.length > 0;
    }

    public override getProjectionBuildDescriptor(
        meetingSettingsService: MeetingSettingsService
    ): ProjectionBuildDescriptor {
        const slideOptions: SlideOptions = [
            {
                key: `mode`,
                displayName: _(`Which version?`),
                default: meetingSettingsService.instant(`motions_recommendation_text_mode`)!,
                choices: [
                    { value: `original`, displayName: `Original version` },
                    { value: `changed`, displayName: `Changed version` },
                    { value: `diff`, displayName: `Diff version` },
                    { value: `agreed`, displayName: `Final version` }
                ]
            }
        ];

        return {
            content_object_id: this.fqid,
            slideOptions,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getAgendaSlideTitle
        };
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        if (this.isParagraphBasedAmendment()) {
            return PROJECTIONDEFAULT.amendment;
        } else {
            return PROJECTIONDEFAULT.motion;
        }
    }
}

interface IMotionRelations extends HasPolls<ViewMotion> {
    lead_motion?: ViewMotion;
    amendments: ViewMotion[]; // children to lead_motion
    sort_parent?: ViewMotion;
    sort_children: ViewMotion[];
    origin?: ViewMotion;
    origin_meeting?: ViewMeeting;
    derived_motions?: ViewMotion[];
    all_derived_motions?: ViewMotion[];
    all_origins?: ViewMotion[];
    identical_motions?: ViewMotion[];
    state?: ViewMotionState;
    state_extension_references: (BaseViewModel & HasReferencedMotionsInExtension)[];
    recommendation?: ViewMotionState;
    recommendation_extension_references: (BaseViewModel & HasReferencedMotionsInExtension)[];
    category?: ViewMotionCategory;
    block?: ViewMotionBlock;
    submitters: ViewMotionSubmitter[];
    supporter_meeting_users: ViewMeetingUser[];
    change_recommendations: ViewMotionChangeRecommendation[];
    statute_paragraph?: ViewMotionStatuteParagraph;
    comments: ViewMotionComment[];
}

export interface ViewMotion
    extends Motion,
        IMotionRelations,
        HasMeeting,
        HasAttachment,
        HasPersonalNote,
        HasTags,
        HasAgendaItem,
        HasListOfSpeakers,
        HasReferencedMotionsInExtension {}
