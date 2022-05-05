import { MotionTitleInformation, ReferencedMotions } from '../../base/base-motion-slide';

export interface MotionBlockSlideMotionRepresentation extends MotionTitleInformation {
    recommendation?: {
        recommendation_label: string;
        css_class: string;
    };
    recommendation_extension?: string;

    // This property will be calculated and saved here.
    recommendationLabel: string | null;
}

export interface MotionBlockSlideData {
    title: string;
    motions: MotionBlockSlideMotionRepresentation[];
    referenced: ReferencedMotions;
}
