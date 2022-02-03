import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Id } from '../../../core/definitions/key-types';

export const ID = `id`;
export const NAME = `name`;
export const DESCRIPTION = `description`;
export const FORWARD_TO_COMMITTEE_IDS = `forward_to_committee_ids`;
export const ORGANIZATION_TAG_IDS = `organization_tag_ids`;
export const MANAGER_IDS = `manager_ids`;
export const MEETING = `meeting`;
export const MEETING_START_DATE = `meeting_start_date`;
export const MEETING_END_DATE = `meeting_end_date`;

export interface CommitteeCsvPort {
    [ID]: Id;
    [NAME]: string;
    [DESCRIPTION]?: string;
    [FORWARD_TO_COMMITTEE_IDS]?: string;
    [ORGANIZATION_TAG_IDS]?: string;
    [MANAGER_IDS]?: string | number[];
    [MEETING]?: string | number;
    [MEETING_START_DATE]?: string | number;
    [MEETING_END_DATE]?: string | number;
}

export const COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES: Partial<CommitteeCsvPort> = {
    [NAME]: _(`Title`),
    [DESCRIPTION]: _(`Description`),
    [FORWARD_TO_COMMITTEE_IDS]: _(`Can forward motions to committee`),
    [ORGANIZATION_TAG_IDS]: _(`Tags`),
    [MANAGER_IDS]: _(`Administrators`),
    [MEETING]: _(`Meeting`),
    [MEETING_START_DATE]: _(`Start date`),
    [MEETING_END_DATE]: _(`End date`)
};
