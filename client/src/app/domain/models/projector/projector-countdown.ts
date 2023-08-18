import { Id } from 'src/app/domain/definitions/key-types';

import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a countdown
 */
export class ProjectorCountdown extends BaseModel<ProjectorCountdown> {
    public static COLLECTION = `projector_countdown`;

    public title!: string;
    public description!: string;
    public default_time!: number;
    public countdown_time!: number;
    public running!: boolean;

    public used_as_list_of_speakers_countdown_meeting_id: Id; // meeting/list_of_speakers_countdown_id;
    public used_as_poll_countdown_meeting_id: Id; // meeting/poll_countdown_id;

    public constructor(input?: any) {
        super(ProjectorCountdown.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof ProjectorCountdown)[] = [
        `id`,
        `title`,
        `description`,
        `default_time`,
        `countdown_time`,
        `running`,
        `projection_ids`,
        `used_as_list_of_speakers_countdown_meeting_id`,
        `used_as_poll_countdown_meeting_id`,
        `meeting_id`
    ];
}
export interface ProjectorCountdown extends HasMeetingId, HasProjectionIds {}
