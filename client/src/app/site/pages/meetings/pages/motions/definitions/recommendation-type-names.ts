import { ModificationType } from 'src/app/domain/models/motions/motions.constants';

import { ViewMotionChangeRecommendation, ViewUnifiedChange } from '../modules';

/**
 * Gets the name of the modification type
 *
 * @param change
 * @returns the name of a recommendation type
 */
export function getRecommendationTypeName(change: ViewMotionChangeRecommendation | ViewUnifiedChange): string {
    switch (change.getModificationType()) {
        case ModificationType.TYPE_REPLACEMENT:
            return `Replacement`;
        case ModificationType.TYPE_INSERTION:
            return `Insertion`;
        case ModificationType.TYPE_DELETION:
            return `Deletion`;
        default:
            return (change as ViewMotionChangeRecommendation).other_description || ``;
    }
}
