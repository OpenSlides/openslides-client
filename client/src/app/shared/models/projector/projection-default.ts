import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

/**
 * Representation of a projection default
 *
 * @ignore
 */
export class Projectiondefault extends BaseModel<Projectiondefault> {
    public static COLLECTION = 'projectiondefault';

    public id: Id;
    public name: string;
    public display_name: string;

    public projector_id: Id; // projector/projectiondefault_ids;

    public constructor(input?: any) {
        super(Projectiondefault.COLLECTION, input);
    }
}
export interface Projectiondefault extends HasMeetingId {}
