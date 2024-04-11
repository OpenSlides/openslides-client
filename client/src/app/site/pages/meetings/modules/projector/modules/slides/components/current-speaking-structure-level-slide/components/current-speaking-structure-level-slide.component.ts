import { Component } from '@angular/core';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { CurrentSpeakingStructureLevelSlideData } from '../current-speaking-structure-level-slide-data';

@Component({
    selector: `os-current-speaking-structure-level-speakers-slide`,
    templateUrl: `./current-speaking-structure-level-slide.component.html`,
    styleUrls: [`./current-speaking-structure-level-slide.component.scss`]
})
export class CurrentSpeakingStructureLevelSlideComponent extends BaseSlideComponent<CurrentSpeakingStructureLevelSlideData> {
    public SpeechState = SpeechState;
}
