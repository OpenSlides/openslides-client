import { Component } from '@angular/core';
import { getSpeakerStateIcon, getSpeakerVerboseState } from 'src/app/domain/models/speakers/speaker';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { CurrentSpeakingStructureLevelSlideData } from '../current-speaking-structure-level-slide-data';

@Component({
    selector: `os-current-speaking-structure-level-speakers-slide`,
    templateUrl: `./current-speaking-structure-level-slide.component.html`,
    styleUrls: [`./current-speaking-structure-level-slide.component.scss`],
    standalone: false
})
export class CurrentSpeakingStructureLevelSlideComponent extends BaseSlideComponent<CurrentSpeakingStructureLevelSlideData> {
    public SpeechState = SpeechState;
    public icon: string;
    public verboseState: string;

    protected override setData(value: SlideData<CurrentSpeakingStructureLevelSlideData>): void {
        super.setData(value);
        this.icon = getSpeakerStateIcon(value.data);
        this.verboseState = getSpeakerVerboseState(value.data);
    }
}
