import { BaseModel } from '../base/base-model';

/**
 * Representation of a statute paragraph.
 * @ignore
 */
export class MotionStatuteParagraph extends BaseModel<MotionStatuteParagraph> {
    public static COLLECTION = 'motion_statute_paragraph';

    public id: number;
    public title: string;
    public text: string;
    public weight: number;

    public constructor(input?: any) {
        super(MotionStatuteParagraph.COLLECTION, input);
    }
}
