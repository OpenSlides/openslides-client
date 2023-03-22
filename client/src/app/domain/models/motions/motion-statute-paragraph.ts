import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a statute paragraph.
 * @ignore
 */
export class MotionStatuteParagraph extends BaseModel<MotionStatuteParagraph> {
    public static COLLECTION = `motion_statute_paragraph`;

    public sequential_number!: number;
    public title!: string;
    public text!: string;
    public weight!: number;

    public motion_ids!: Id[]; // (motion/statute_paragraph_id)[];

    public constructor(input?: any) {
        super(MotionStatuteParagraph.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MotionStatuteParagraph | { templateField: string })[] = [
        `id`,
        `title`,
        `text`,
        `weight`,
        `sequential_number`,
        `motion_ids`,
        `meeting_id`
    ];
}
export interface MotionStatuteParagraph extends HasMeetingId {}
