import { _ } from 'app/core/translate/translation-marker';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';

export interface MeetingTitleInformation {
    name: string;
}

export class ViewMeeting extends BaseViewModel<Meeting> implements MeetingTitleInformation {
    public static COLLECTION = Meeting.COLLECTION;
    protected _collection = Meeting.COLLECTION;

    public get meeting(): Meeting {
        return this._model;
    }
}
interface IMeetingRelations {
    motions_default_workflow: ViewMotionWorkflow;
    motions_default_statute_amendments_workflow: ViewMotionWorkflow;
    // To be continued...
}
export interface ViewMeeting extends Meeting, IMeetingRelations {}
