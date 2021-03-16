import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { Assignment, AssignmentPhase } from 'app/shared/models/assignments/assignment';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { HasAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { HasAttachment } from 'app/site/mediafiles/models/view-mediafile';
import { HasViewPolls } from 'app/site/polls/models/has-view-polls';
import { HasTags } from 'app/site/tags/models/view-tag';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewAssignmentCandidate } from './view-assignment-candidate';

/**
 * A constant containing all possible assignment phases and their different
 * representations as numerical value, string as used in server, and the display
 * name.
 */
export const AssignmentPhases: { name: string; value: AssignmentPhase; display_name: string }[] = [
    {
        name: 'PHASE_SEARCH',
        value: AssignmentPhase.Search,
        display_name: 'Searching for candidates'
    },
    {
        name: 'PHASE_VOTING',
        value: AssignmentPhase.Voting,
        display_name: 'In the election process'
    },
    {
        name: 'PHASE_FINISHED',
        value: AssignmentPhase.Finished,
        display_name: 'Finished'
    }
];

export class ViewAssignment extends BaseProjectableViewModel<Assignment> {
    public static COLLECTION = Assignment.COLLECTION;
    protected _collection = Assignment.COLLECTION;

    public get assignment(): Assignment {
        return this._model;
    }

    public get candidatesAsUsers(): ViewUser[] {
        return this.candidates?.map(candidate => candidate.user).filter(x => !!x);
    }

    public get phaseString(): string {
        const phase = AssignmentPhases.find(ap => ap.value === this.phase);
        return phase ? phase.display_name : '';
    }

    /**
     * @returns true if the assignment is in the 'finished' state
     * (not accepting votes or candidates anymore)
     */
    public get isFinished(): boolean {
        const finishedState = AssignmentPhases.find(ap => ap.name === 'PHASE_FINISHED');
        return this.phase === finishedState.value;
    }

    /**
     * @returns true if the assignment is in the 'searching' state
     */
    public get isSearchingForCandidates(): boolean {
        const searchState = AssignmentPhases.find(ap => ap.name === 'PHASE_SEARCH');
        return this.phase === searchState.value;
    }

    /**
     * @returns the amount of candidates in the assignment's candidate list
     */
    public get candidateAmount(): number {
        return this.candidate_ids?.length || 0;
    }

    public formatForSearch(): SearchRepresentation {
        return { properties: [{ key: 'Title', value: this.getTitle() }], searchValue: [this.getTitle()] };
    }

    public getDetailStateURL(): string {
        return `/assignments/${this.id}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.assignment;
    }
}
interface IAssignmentRelations extends HasViewPolls<ViewPoll> {
    candidates: ViewAssignmentCandidate[];
    polls: ViewPoll[];
}
export interface ViewAssignment
    extends Assignment,
        IAssignmentRelations,
        HasMeeting,
        HasAttachment,
        HasTags,
        HasAgendaItem,
        HasListOfSpeakers {}
