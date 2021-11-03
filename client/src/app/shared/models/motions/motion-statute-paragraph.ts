import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a statute paragraph.
 * @ignore
 */
export class MotionStatuteParagraph extends BaseModel<MotionStatuteParagraph> {
    public static COLLECTION = `motion_statute_paragraph`;

    public id: Id;
    public title: string;
    public text: string;
    public weight: number;

    public motion_ids: Id[]; // (motion/statute_paragraph_id)[];

    public constructor(input?: any) {
        super(MotionStatuteParagraph.COLLECTION, input);
    }
}
export interface MotionStatuteParagraph extends HasMeetingId {}
