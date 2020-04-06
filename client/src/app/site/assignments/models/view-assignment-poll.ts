import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject } from 'rxjs';

import { ChartData } from 'app/shared/components/charts/charts.component';
import {
    AssignmentPoll,
    AssignmentPollMethod,
    AssignmentPollPercentBase
} from 'app/shared/models/assignments/assignment-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { BaseViewPoll, PollClassType } from 'app/site/polls/models/base-view-poll';
import { ViewAssignment } from './view-assignment';
import { ViewAssignmentOption } from './view-assignment-option';

export interface AssignmentPollTitleInformation {
    title: string;
}

export const AssignmentPollMethodVerbose = {
    Y: _('Yes per candidate'),
    N: _('No per candidate'),
    YN: _('Yes/No per candidate'),
    YNA: _('Yes/No/Abstain per candidate')
};

export const AssignmentPollPercentBaseVerbose = {
    Y: _('Sum of votes including general No/Abstain'),
    YN: _('Yes/No per candidate'),
    YNA: _('Yes/No/Abstain per candidate'),
    valid: _('All valid ballots'),
    cast: _('All casted ballots'),
    disabled: _('Disabled (no percents)')
};

export class ViewAssignmentPoll
    extends BaseViewPoll<AssignmentPoll, ViewAssignmentOption, AssignmentPollMethod, AssignmentPollPercentBase>
    implements AssignmentPollTitleInformation {
    public static COLLECTION = AssignmentPoll.COLLECTION;
    protected _collection = AssignmentPoll.COLLECTION;

    public readonly tableChartData: Map<string, BehaviorSubject<ChartData>> = new Map();
    public readonly pollClassType = PollClassType.Assignment;

    public get assignmentPoll(): AssignmentPoll {
        return this._model;
    }

    public get pollmethodVerbose(): string {
        return AssignmentPollMethodVerbose[this.pollmethod];
    }

    public get percentBaseVerbose(): string {
        return AssignmentPollPercentBaseVerbose[this.onehundred_percent_base];
    }

    public getContentObject(): BaseViewModel {
        return this.assignment;
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                name: AssignmentPoll.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'assignment_poll',
            getDialogTitle: this.getTitle
        };
    }

    protected getDecimalFields(): string[] {
        return AssignmentPoll.DECIMAL_FIELDS;
    }
}
interface IAssignmentPollRelations {
    assignment: ViewAssignment;
}
export interface ViewAssignmentPoll extends AssignmentPoll, IAssignmentPollRelations {}
