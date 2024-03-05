import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { MeetingAction } from '../repositories/meetings';
import { MotionAction } from '../repositories/motions';
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
 * A type of map that maps regular expressions (of error messages) to either a cleaner string-message, a function calculating such a string message, or an Error-object containing such a string message.
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

const MatchAllErrorMap: ErrorMap = new ErrorMap([[/(.*)/, input => new MapError(input)]]);
const MeetingCreateErrorMap: ErrorMap = new ErrorMap([
    [
        /Only one of start_time and end_time is not allowed./,
        _(`Start and end time must either both be set or both be empty`)
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
        case MotionAction.CREATE_FORWARDED:
        case UserAction.FORGET_PASSWORD_CONFIRM:
        case UserAction.SET_PASSWORD_SELF:
            return MatchAllErrorMap;
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
