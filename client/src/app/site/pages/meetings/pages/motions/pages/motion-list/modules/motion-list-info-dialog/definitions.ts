import { Id } from 'src/app/domain/definitions/key-types';

/**
 * Interface to describe possible values and changes for
 * meta information dialog.
 */
export interface MotionListInfoDialogConfig {
    /**
     * Id of the selected motion
     */
    id: Id;
    /**
     * The title of the motion
     */
    title: string;

    update: {
        /**
         * The motion block id
         */
        block_id: number;

        /**
         * The category id
         */
        category_id: number;

        /**
         * The motions tag ids
         */
        tag_ids: number[];
    };

    /**
     * The id of the state
     */
    state_id: number;

    /**
     * The id of the recommendation
     */
    recommendation_id: number;
}
