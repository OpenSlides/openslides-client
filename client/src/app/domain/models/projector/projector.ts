import { Id } from '../../definitions/key-types';
import { HasSequentialNumber } from '../../interfaces';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProperties } from '../../interfaces/has-properties';
import { BaseModel } from '../base/base-model';
import { ProjectiondefaultValue } from './projection-default';
import { ProjectorMeetingUsageIdKey } from './projector.constants';

/**
 * Representation of a projector.
 */
export class Projector extends BaseModel<Projector> {
    public static COLLECTION = `projector`;

    public name!: string;
    public scale!: number;
    public scroll!: number;
    public width!: number;
    public aspect_ratio_numerator!: number;
    public aspect_ratio_denominator!: number;
    public color!: string;
    public background_color!: string;
    public header_background_color!: string;
    public header_font_color!: string;
    public header_h1_color!: string;
    public chyron_background_color!: string;
    public chyron_font_color!: string;
    public show_header_footer!: boolean;
    public show_title!: boolean;
    public show_logo!: boolean;
    public show_clock!: boolean;
    public is_internal!: boolean;

    public current_projection_ids!: Id[]; // (projection/current_projector_id)[];
    public preview_projection_ids!: Id[]; // (projection/preview_projector_id)[];
    public history_projection_ids!: Id[]; // (projection/history_projector_id)[];
    public used_as_reference_projector_meeting_id!: Id; // meeting/reference_projector_id;

    /**
     * @returns Calculate the height of the projector
     */
    public get height(): number {
        const ratio = this.aspect_ratio_numerator / this.aspect_ratio_denominator;
        return this.width / ratio;
    }

    /**
     * get the aspect ratio as string
     */
    public get aspectRatio(): string {
        return [this.aspect_ratio_numerator, this.aspect_ratio_denominator].join(`:`);
    }

    /**
     * Set the aspect ratio
     */
    public set aspectRatio(ratioString: string) {
        const ratio = ratioString.split(`:`).map(x => +x);
        if (ratio.length === 2) {
            this.aspect_ratio_numerator = ratio[0];
            this.aspect_ratio_denominator = ratio[1];
        } else {
            throw new Error(`Projector received unexpected aspect ratio! ` + ratio.toString());
        }
    }

    public constructor(input?: any) {
        super(Projector.COLLECTION, input);
    }

    public used_as_default_in_meeting_id(projectiondefault: ProjectiondefaultValue): Id | null {
        return (this[`used_as_default_${projectiondefault}_in_meeting_id` as keyof Projector] as Id) || null;
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Projector)[] = [
        `id`,
        `name`,
        `is_internal`,
        `scale`,
        `scroll`,
        `width`,
        `aspect_ratio_numerator`,
        `aspect_ratio_denominator`,
        `color`,
        `background_color`,
        `header_background_color`,
        `header_font_color`,
        `header_h1_color`,
        `chyron_background_color`,
        `chyron_font_color`,
        `show_header_footer`,
        `show_title`,
        `show_logo`,
        `show_clock`,
        `sequential_number`,
        `current_projection_ids`,
        `preview_projection_ids`,
        `history_projection_ids`,
        `used_as_reference_projector_meeting_id`,
        `meeting_id`
    ];
}
export interface Projector
    extends HasMeetingId,
        HasSequentialNumber,
        HasProperties<ProjectorMeetingUsageIdKey, number> {}
