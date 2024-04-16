import { BaseSimplifiedModelRequest, Follow, FollowList } from 'src/app/site/services/model-request-builder';

/**
 * Fieldset used if no fieldset is specified
 */
export const FULL_FIELDSET = `detail`;

/**
 * Fieldset used for navigation purposes
 */
export const ROUTING_FIELDSET = `routing`;

export const MEETING_ROUTING_FIELDS = [`sequential_number`, `meeting_id`];

/**
 * Merges two subscription follow.
 * This should not be used for complex model requests.
 *
 * Also note that a missing fieldset will result in using the fieldset of
 * the subscription where it is set.
 */
export function mergeSubscriptionFollow(
    rq1: Follow | BaseSimplifiedModelRequest,
    rq2: Follow | BaseSimplifiedModelRequest
): Follow {
    const merged: Follow = structuredClone(rq1);
    if (rq1.fieldset && rq2.fieldset && (typeof rq1.fieldset === `string` || typeof rq2.fieldset === `string`)) {
        throw new Error(`Fieldset type mismatch`);
    }

    if (!merged.fieldset) {
        merged.fieldset = rq2.fieldset;
    } else if (rq2.fieldset) {
        merged.fieldset = merged.fieldset.concat(...rq2.fieldset);
    }

    if (!merged.follow && rq2.follow) {
        merged.follow = rq2.follow;
    } else if (rq2.follow) {
        const rq2Follows: FollowList<unknown> = structuredClone(rq2.follow);
        for (let follow of merged.follow) {
            const field = typeof follow === `string` ? follow : follow.idField;
            const rq2FollowIdx = rq2Follows.findIndex(v => (typeof v === `string` ? v : v.idField) === field);
            if (typeof follow === `string`) {
                follow = { idField: follow };
            }

            if (rq2FollowIdx !== -1) {
                let rq2Follow = rq2Follows[rq2FollowIdx];
                if (typeof rq2Follow === `string`) {
                    rq2Follow = { idField: rq2Follow };
                }
                rq2Follows[rq2FollowIdx] = mergeSubscriptionFollow(follow, rq2Follow);
            } else {
                rq2Follows.push(follow);
            }
        }
        merged.follow = rq2Follows;
    }

    return merged;
}
