import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { HasSequentialNumber } from 'src/app/domain/interfaces';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { PROJECTIONDEFAULT, Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { HasMeeting } from '../../../view-models/has-meeting';
import { HasListOfSpeakers } from '../../agenda/modules/list-of-speakers';
import { HasAgendaItem } from '../../agenda/view-models/has-agenda-item';
import { HasAttachment } from '../../mediafiles/view-models/has-attachment';
import { HasTags } from '../../motions/modules/tags/view-models/has-tags';
import { HasPolls, VotingTextContext } from '../../polls/view-models/has-polls';
import { ViewPoll } from '../../polls/view-models/view-poll';
import { AssignmentPhases } from '../definitions';
import { ViewAssignmentCandidate } from './view-assignment-candidate';

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
        return phase ? phase.display_name : ``;
    }

    /**
     * @returns true if the assignment is in the 'finished' state
     * (not accepting votes or candidates anymore)
     */
    public get isFinished(): boolean {
        const finishedState = AssignmentPhases.find(ap => ap.name === `PHASE_FINISHED`);
        return this.phase === finishedState?.value;
    }

    /**
     * @returns true if the assignment is in the 'searching' state
     */
    public get isSearchingForCandidates(): boolean {
        const searchState = AssignmentPhases.find(ap => ap.name === `PHASE_SEARCH`);
        return this.phase === searchState?.value;
    }

    /**
     * @returns the amount of candidates in the assignment's candidate list
     */
    public get candidateAmount(): number {
        return this.candidate_ids?.length || 0;
    }

    public getVotingText(context: VotingTextContext<ViewAssignment>): string {
        return `${this.getTitle()}: ${context.translateFn(_(`Ballot opened`))}`;
    }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/assignments/${this.sequential_number}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return PROJECTIONDEFAULT.assignment;
    }
}
interface IAssignmentRelations extends HasPolls<ViewAssignment> {
    candidates: ViewAssignmentCandidate[];
    polls: ViewPoll<ViewAssignment>[];
}
export interface ViewAssignment
    extends Assignment,
        IAssignmentRelations,
        HasMeeting,
        HasAttachment,
        HasTags,
        HasAgendaItem,
        HasListOfSpeakers,
        HasSequentialNumber {}
