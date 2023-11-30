import { StructureLevelListOfSpeakers } from 'src/app/domain/models/structure-levels/structure-level-list-of-speakers';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';
import { ViewListOfSpeakers, ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';


export class ViewStructureLevelListOfSpeakers extends BaseViewModel<StructureLevelListOfSpeakers> {
    public static COLLECTION = StructureLevelListOfSpeakers.COLLECTION;
}
interface IViewStructureLevelListOfSpeakersRelations {
    structure_level: ViewStructureLevel;
    list_of_speakers: ViewListOfSpeakers;
    speakers: ViewSpeaker[];
}
export interface ViewStructureLevelListOfSpeakers extends StructureLevelListOfSpeakers, IViewStructureLevelListOfSpeakersRelations, HasMeeting {}
