import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { Id } from '../../definitions/key-types';

export const ID = `id`;
export const NAME = `name`;
export const DESCRIPTION = `description`;
export const FORWARD_TO_COMMITTEES = `forward_to_committees`;
export const ORGANIZATION_TAGS = `organization_tags`;
export const MANAGERS = `managers`;
export const MEETING_NAME = `meeting_name`;
export const MEETING_START_TIME = `meeting_start_time`;
export const MEETING_END_TIME = `meeting_end_time`;
export const MEETING_ADMINS = `meeting_admins`;
export const MEETING_TEMPLATE = `meeting_template`;

export interface CommitteeCsvPort {
    [ID]: Id;
    [NAME]: string;
    [DESCRIPTION]?: string;
    [FORWARD_TO_COMMITTEES]?: string;
    [ORGANIZATION_TAGS]?: string;
    [MANAGERS]?: string | number[];
    [MEETING_NAME]?: string | number;
    [MEETING_START_TIME]?: string | number;
    [MEETING_END_TIME]?: string | number;
    [MEETING_ADMINS]?: string | number[];
    [MEETING_TEMPLATE]?: string | number;
}
