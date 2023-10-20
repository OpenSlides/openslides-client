import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { AssignmentPhase } from 'src/app/domain/models/assignments/assignment-phase';

/**
 * A constant containing all possible assignment phases and their different
 * representations as numerical value, string as used in server, and the display
 * name.
 */
export const AssignmentPhases: { name: string; value: AssignmentPhase; display_name: string }[] = [
    {
        name: `PHASE_SEARCH`,
        value: AssignmentPhase.Search,
        display_name: _(`Searching for candidates`)
    },
    {
        name: `PHASE_VOTING`,
        value: AssignmentPhase.Voting,
        display_name: _(`In the election process`)
    },
    {
        name: `PHASE_FINISHED`,
        value: AssignmentPhase.Finished,
        display_name: _(`Finished`)
    }
];
