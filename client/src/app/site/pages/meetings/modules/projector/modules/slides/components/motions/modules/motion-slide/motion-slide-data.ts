import { MotionFormattingRepresentation } from 'src/app/domain/models/motions/motion';
import { MergeAmendment } from 'src/app/domain/models/motions/motion-state';
import { LineNumberingMode, ModificationType } from 'src/app/domain/models/motions/motions.constants';

import { MotionTitleInformation, ReferencedMotions } from '../../base/base-motion-slide';

/**
 * This interface describes the data returned by the server about a motion that is changed by an amendment.
 * It only contains the data necessary for rendering the amendment's diff.
 */
export interface LeadMotionData {
    number: string;
    title: string;
    text: string;
}

/**
 * This interface describes the data returned by the server about a statute paragraph that is changed by an amendment.
 * It only contains the data necessary for rendering the amendment's diff.
 */
export interface BaseStatuteData {
    title: string;
    text: string;
}

/**
 * This interface describes the data returned by the server about a change recommendation.
 */
export interface ChangeRecommendationData {
    id: number;
    rejected: boolean;
    type: ModificationType;
    other_description: string;
    line_from: number;
    line_to: number;
    text: string;
    creation_time: number;
}

/**
 * This interface describes the data returned by the server about an amendment.
 * This object is used if actually the motion is shown and the amendment is shown in the context of the motion.
 */
export interface AmendmentData {
    id: number;
    title: string;
    number: string;
    amendment_paragraphs: { [paragraphNumber: string]: string };
    change_recommendations: ChangeRecommendationData[];
    merge_amendment_into_final: MergeAmendment;
    merge_amendment_into_diff: MergeAmendment;
}

/**
 * This interface describes either an motion (with all amendments and change recommendations enbedded)
 * or an amendment (with the bas motion embedded).
 */
export interface MotionSlideData extends MotionFormattingRepresentation {
    number: string;
    title: string;
    reason: string;
    submitters: string[];
    amendment_paragraphs: { [paragraphNumber: string]: string };
    lead_motion: LeadMotionData;
    base_statute: BaseStatuteData;
    change_recommendations: ChangeRecommendationData[];
    amendments: AmendmentData[];
    recommendation_referencing_motions?: MotionTitleInformation[];
    recommendation_label?: string;
    recommendation_extension?: string;
    recommendation_referenced_motions?: ReferencedMotions;
    recommender: string;
    show_sidebox: boolean;
    line_length: number;
    preamble: string;
    line_numbering: LineNumberingMode;
}
