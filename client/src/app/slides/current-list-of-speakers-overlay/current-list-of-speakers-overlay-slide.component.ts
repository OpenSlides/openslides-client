import { Component } from '@angular/core';

import { BaseSlideComponent } from 'app/slides/base-slide-component';
import {
    CommonListOfSpeakersSlideData,
    SlideSpeaker
} from '../common-list-of-speakers/common-list-of-speakers-slide-data';

@Component({
    selector: 'os-current-list-of-speakers-overlay-slide',
    templateUrl: './current-list-of-speakers-overlay-slide.component.html',
    styleUrls: ['./current-list-of-speakers-overlay-slide.component.scss']
})
export class CurrentListOfSpeakersOverlaySlideComponent extends BaseSlideComponent<CommonListOfSpeakersSlideData> {
    /**
     * The current speaker.
     */
    public get currentSpeaker(): SlideSpeaker {
        return this.data.data.current;
    }

    /**
     * List with the next speakers for this list.
     */
    public get nextSpeakers(): SlideSpeaker[] {
        return this.data.data.waiting || [];
    }

    public constructor() {
        super();
    }
}
