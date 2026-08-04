import { _ } from '@ngx-translate/core';

import { AgendaItemAction } from '../repositories/agenda';
import { CommitteeAction } from '../repositories/committees/committee.action';
import { MeetingAction } from '../repositories/meetings';
import { MotionAction } from '../repositories/motions';
import { TopicAction } from '../repositories/topics/topic.action';
import { UserAction } from '../repositories/users/user-action';

export class MapError {
    public constructor(private message: string) {}

    public getError(): Error {
        return new Error(this.message);
    }
}

export function isMapError(obj: any): obj is MapError {
    return obj && typeof obj === `object` && obj.getError && typeof obj.getError === `function`;
}

/**
 * A type of map that maps regular expressions (of error messages) to either a cleaner string-message,
 * a function calculating such a string message, or an Error-object containing such a string message.
 */
export class ErrorMap extends Map<RegExp, string | MapError | ((input: string) => string | MapError)> {}

const AuthServiceErrorMap: ErrorMap = new ErrorMap([
    [/Username or password is incorrect./, new MapError(_(`Username or password is incorrect.`))],
    [/Multiple users found for same username!/, _(`Multiple users found for same username!`)],
    [/Multiple users with same credentials!/, _(`Multiple users with same credentials!`)],
    [/The account is deactivated./, _(`The account is deactivated.`)],
    [/Property [\S]+ is [\S]+/, _(`User not found.`)]
]);

const VoteServiceErrorMap: ErrorMap = new ErrorMap([
    [/Not the first vote/, _(`You have already voted.`)],
    [/Poll does already exist with differet config/, _(`An error occurred while voting.`)],
    [/Poll does not exist/, _(`An error occurred while voting.`)],
    [/The input data is invalid/, _(`The input data for voting is invalid.`)],
    [/The vote is not open for votes/, _(`You can not vote right now because the voting has not yet started.`)],
    [/You are not allowed to vote/, _(`You do not have the permission to vote.`)],
    [/Ups, something went wrong!/, _(`An error occurred while voting.`)],
    [/is not allowed to vote/, _(`You do not have the permission to vote.`)]
]);

const MatchAllErrorMap: ErrorMap = new ErrorMap([[/(.*)/, (input): MapError => new MapError(input)]]);
const MeetingCreateErrorMap: ErrorMap = new ErrorMap([
    [
        /Only one of start_time and end_time is not allowed./,
        _(`Start and end time must either both be set or both be empty`)
    ],
    [/Cannot create non-template meeting without admin_ids/, _(`Cannot create meeting without administrator.`)]
]);
const MeetingArchiveErrorMap: ErrorMap = new ErrorMap([
    [
        /Cannot archive meeting with active speakers\./,
        _(`Cannot archive meeting with active speakers. Check who is speaking in > [Participants] > [Contributions].`)
    ],
    [/Cannot archive meeting with active polls\./, _(`Cannot archive meeting with active polls.`)],
    [
        /Cannot archive meeting with active speakers and polls\./,
        _(
            `Cannot archive meeting with active speakers and polls. Check who is speaking in > [Participants] > [Contributions].`
        )
    ]
]);
const json_upload_decimal_error_messages = {
    default_vote_weight: _(
        `Invalid format in column 'default_vote_weight' expected decimal number with point separation (f.e. '1.234567')`
    ),
    vote_weight: _(
        `Invalid format in column 'vote_weight' expected decimal number with point separation (f.e. '1.234567')`
    )
};
const json_upload_integer_error_messages = {
    agenda_duration: _(`Invalid format in column 'agenda_duration' expected integer (i.e. a natural number)`)
};
const json_upload_boolean_error_messages = {
    is_active: _(`Invalid format in column 'is_active' expected boolean (f.E. '1' for yes, '0' for no)`),
    is_physical_person: _(
        `Invalid format in column 'is_physical_person' expected boolean (f.E. '1' for yes, '0' for no)`
    ),
    is_present: _(`Invalid format in column 'is_present' expected boolean (f.E. '1' for yes, '0' for no)`),
    locked_out: _(`Invalid format in column 'locked_out' expected boolean (f.E. '1' for yes, '0' for no)`),
    external: _(`Invalid format in column 'external' expected boolean (f.E. '1' for yes, '0' for no)`)
};
const json_upload_date_error_messages = {
    meeting_start_time: _(`Invalid date format in column 'meeting_start_time' expected 'YYYY-MM-DD'`),
    meeting_end_time: _(`Invalid date format in column 'meeting_end_time' expected 'YYYY-MM-DD'`)
};
const JsonUploadErrorMap: ErrorMap = new ErrorMap([
    [
        /For column [\S]+: Invalid format (.*?) expected decimal number with point separation \(f.e. 1.234567\)/,
        (input): string => json_upload_decimal_error_messages[input.split(`:`)[0].split(` `).at(-1)]
    ],
    [
        /For column [\S]+: Invalid format (.*?) expected integer \(i.e. a natural number\)/,
        (input): string => json_upload_integer_error_messages[input.split(`:`)[0].split(` `).at(-1)]
    ],
    [
        /For column [\S]+: Invalid format (.*?) expected boolean \(f.E. '1' for yes, '0' for no\)/,
        (input): string => json_upload_boolean_error_messages[input.split(`:`)[0].split(` `).at(-1)]
    ],
    [
        /For column [\S]+: Invalid date format (.*?) \(expected YYYY-MM-DD\)/,
        (input): string => json_upload_date_error_messages[input.split(`:`)[0].split(` `).at(-1)]
    ]
]);

/**
 * Finds the correct error map for an action response by the original requests action name
 * TODO: Expand for other actions
 */
const getActionErrorMap: (data: any) => ErrorMap | null = data => {
    const actionName = Array.isArray(data) && typeof data[0] === `object` ? data[0][`action`] : null;
    switch (actionName) {
        case MeetingAction.CREATE:
            return MeetingCreateErrorMap;
        case MeetingAction.ARCHIVE:
            return MeetingArchiveErrorMap;
        case MotionAction.CREATE_FORWARDED:
        case AgendaItemAction.FORWARD:
        case UserAction.FORGET_PASSWORD_CONFIRM:
        case UserAction.SET_PASSWORD_SELF:
            return MatchAllErrorMap;
        case UserAction.PARTICIPANT_JSON_UPLOAD:
        case UserAction.ACCOUNT_JSON_UPLOAD:
        case CommitteeAction.JSON_UPLOAD:
        case TopicAction.JSON_UPLOAD:
            return JsonUploadErrorMap;
        default:
            if (typeof actionName === `string` && actionName.endsWith(`.import`)) {
                return MatchAllErrorMap;
            }
            return null;
    }
};

/**
 * Holds http-request path segments and corresponding ErrorMaps.
 */
export const UrlFragmentToHttpErrorMap = new Map<string, ErrorMap | ((data: any) => ErrorMap | null)>([
    [`auth`, AuthServiceErrorMap],
    [`action`, getActionErrorMap],
    [`vote`, VoteServiceErrorMap]
]);

export const DefaultErrorMap: ErrorMap = new ErrorMap([]);
