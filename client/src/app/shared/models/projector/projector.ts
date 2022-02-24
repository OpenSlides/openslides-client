import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasSequentialNumber } from '../base/has-sequential-number';

export enum Projectiondefault {
    agendaAllItems = `agenda_all_items`,
    topics = `topics`,
    listOfSpeakers = `list_of_speakers`,
    currentListOfSpeakers = `current_list_of_speakers`,
    motion = `motion`,
    amendment = `amendment`,
    motionBlock = `motion_block`,
    assignment = `assignment`,
    user = `user`,
    mediafile = `mediafile`,
    projectorMessage = `projector_message`,
    projectorCountdown = `projector_countdowns`,
    assignmentPoll = `assignment_poll`,
    motionPoll = `motion_poll`,
    poll = `poll`
}

/**
 * Representation of a projector.
 *
 * @ignore
 */
export class Projector extends BaseModel<Projector> {
    public static COLLECTION = `projector`;

    public id: Id;
    public name: string;
    public scale: number;
    public scroll: number;
    public width: number;
    public aspect_ratio_numerator: number;
    public aspect_ratio_denominator: number;
    public color: string;
    public background_color: string;
    public header_background_color: string;
    public header_font_color: string;
    public header_h1_color: string;
    public chyron_background_color: string;
    public chyron_font_color: string;
    public show_header_footer: boolean;
    public show_title: boolean;
    public show_logo: boolean;
    public show_clock: boolean;

    public current_projection_ids: Id[]; // (projection/current_projector_id)[];
    public preview_projection_ids: Id[]; // (projection/preview_projector_id)[];
    public history_projection_ids: Id[]; // (projection/history_projector_id)[];
    public used_as_reference_projector_meeting_id: Id; // meeting/reference_projector_id;
    public used_as_default_$_in_meeting_id: Projectiondefault[]; // meeting/default_projector_$_id;

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

    public used_as_default_in_meeting_id(projectiondefault: Projectiondefault): Id | null {
        return this[`used_as_default_$${projectiondefault}_in_meeting_id`] || null;
    }
}
export interface Projector extends HasMeetingId, HasSequentialNumber {}
