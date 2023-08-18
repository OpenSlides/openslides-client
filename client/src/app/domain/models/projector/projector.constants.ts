import { PROJECTIONDEFAULTS, ProjectiondefaultValue } from './projection-default';

export type ProjectorMeetingUsageIdKey = `used_as_default_${ProjectiondefaultValue}_in_meeting_id`;

export const PROJECTOR_MEETING_USAGE_ID_KEYS = PROJECTIONDEFAULTS.map(
    place => `used_as_default_${place}_in_meeting_id`
) as ProjectorMeetingUsageIdKey[];

export type ViewProjectorMeetingUsageKey = `used_as_default_${ProjectiondefaultValue}_in_meeting`;
