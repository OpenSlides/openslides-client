import { BaseModel } from '../base/base-model';

/**
 * Representation of a countdown
 * @ignore
 */
export class Countdown extends BaseModel<Countdown> {
    public static COLLECTION = 'projector_countdown';

    public id: number;
    public description?: string;
    public title: string;
    public default_time: number;
    public countdown_time: number;
    public running: boolean;

    public constructor(input?: any) {
        super(Countdown.COLLECTION, input);
    }
}
