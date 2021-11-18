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
    name: _(`Title`),
    description: _(`Description`),
    forward_to_committee_ids: _(`Can forward motions to committee`),
    organization_tag_ids: _(`Tags`),
    manager_ids: _(`Administrators`),
    meeting: _(`Meeting`),
    meeting_start_date: _(`Start date`),
    meeting_end_date: _(`End date`)
};
