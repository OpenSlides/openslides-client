import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { MotionAction } from '../repositories/motions';

/**
 * A type of map that maps regular expressions (of error messages) to either a cleaner string-message, a function calculating such a string message, or an Error-object containing such a string message.
 */
export class ErrorMap extends Map<RegExp, string | Error | ((input: string) => string | Error)> {}

const AuthServiceErrorMap: ErrorMap = new ErrorMap([
    [/Username or password is incorrect./, new Error(_(`Username or password is incorrect.`))],
    [/Multiple users found for same username!/, _(`Multiple users found for same username!`)],
    [/Multiple users with same credentials!/, _(`Multiple users with same credentials!`)],
    [/The account is deactivated./, _(`The account is deactivated.`)],
    [/Property [\S] is [\S]/, _(`User not found.`)]
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

const MotionCreateForwardErrorMap: ErrorMap = new ErrorMap([[/(.*)/, input => new Error(input)]]);

/**
 * Finds the correct error map for an action response by the original requests action name
 * TODO: Expand for other actions
 */
const getActionErrorMap: (data: any) => ErrorMap | null = data => {
    const actionName = Array.isArray(data) && typeof data[0] === `object` ? data[0][`action`] : null;
    switch (actionName) {
        case MotionAction.CREATE_FORWARDED:
            return MotionCreateForwardErrorMap;
        default:
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
