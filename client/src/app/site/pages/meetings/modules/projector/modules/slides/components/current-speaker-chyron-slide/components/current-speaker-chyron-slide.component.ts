import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { CurrentSpeakerChyronSlideData } from '../current-speaker-chyron-slide-data';

@Component({
    selector: `os-current-speaker-chyron-speakers-slide`,
    templateUrl: `./current-speaker-chyron-slide.component.html`,
    styleUrls: [`./current-speaker-chyron-slide.component.scss`],
    standalone: false
})
export class CurrentSpeakerChyronSlideComponent extends BaseSlideComponent<CurrentSpeakerChyronSlideData> {
    public getSpeaker(): string[] {
        const parts: string[] = [this.data.data.current_speaker_name];
        if (this.data.data.current_speaker_level) {
            parts.push(this.data.data.current_speaker_level);
        }
        return parts;
    }
}
