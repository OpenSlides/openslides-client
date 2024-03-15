import { SPECIAL_SPEECH_STATES } from 'src/app/domain/models/speakers/speech-state';
import { StructureLevelListOfSpeakers } from 'src/app/domain/models/structure-levels/structure-level-list-of-speakers';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewListOfSpeakers, ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

export class ViewStructureLevelListOfSpeakers extends BaseViewModel<StructureLevelListOfSpeakers> {
    public static COLLECTION = StructureLevelListOfSpeakers.COLLECTION;

    public get isInactive(): boolean {
        return (
            !this.current_start_time &&
            this.initial_time + (this.additional_time ?? 0) === this.remaining_time &&
            this.speakers.every(
                speaker => SPECIAL_SPEECH_STATES.includes(speaker.speech_state) || speaker.point_of_order
            )
        );
    }
}
interface IViewStructureLevelListOfSpeakersRelations {
    structure_level: ViewStructureLevel;
    list_of_speakers: ViewListOfSpeakers;
    speakers: ViewSpeaker[];
}
export interface ViewStructureLevelListOfSpeakers
    extends StructureLevelListOfSpeakers,
        IViewStructureLevelListOfSpeakersRelations,
        HasMeeting {}
