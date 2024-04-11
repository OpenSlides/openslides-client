import { Settings } from '../models/meetings/meeting';

export type DelegationSetting = Extract<
    keyof Settings,
    | `users_forbid_delegator_in_list_of_speakers`
    | `users_forbid_delegator_as_submitter`
    | `users_forbid_delegator_as_supporter`
>;

export const delegationSettings: { [key: string]: DelegationSetting } = {
    ForbidLoS: `users_forbid_delegator_in_list_of_speakers`,
    ForbidSubmitter: `users_forbid_delegator_as_submitter`,
    ForbidSupporter: `users_forbid_delegator_as_supporter`
};
