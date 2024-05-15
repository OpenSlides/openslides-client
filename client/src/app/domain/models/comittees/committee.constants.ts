import { Id } from '../../definitions/key-types';

const ID = `id`;
const NAME = `name`;
const DESCRIPTION = `description`;
const FORWARD_TO_COMMITTEES = `forward_to_committees`;
const ORGANIZATION_TAGS = `organization_tags`;
const MANAGERS = `managers`;
const MEETING_NAME = `meeting_name`;
const MEETING_START_TIME = `meeting_start_time`;
const MEETING_END_TIME = `meeting_end_time`;
const MEETING_ADMINS = `meeting_admins`;
const MEETING_TEMPLATE = `meeting_template`;

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
