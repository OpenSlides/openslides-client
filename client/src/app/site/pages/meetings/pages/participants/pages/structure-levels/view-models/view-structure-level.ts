import { StructureLevel } from 'src/app/domain/models/structure-levels/structure-level';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { ViewStructureLevelListOfSpeakers } from './view-structure-level-list-of-speakers';

export class ViewStructureLevel extends BaseViewModel<StructureLevel> {
    public static COLLECTION = StructureLevel.COLLECTION;

    public get title(): string {
        return this._model.name;
    }
}
interface IStructureLevelRelations {
    meeting_users: ViewMeetingUser[];
    structure_level_list_of_speakers: ViewStructureLevelListOfSpeakers[];
}
export interface ViewStructureLevel extends StructureLevel, IStructureLevelRelations, HasMeeting {}
