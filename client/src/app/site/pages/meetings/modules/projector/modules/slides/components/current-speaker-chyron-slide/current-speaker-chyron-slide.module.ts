import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommaSeparatedListingComponent } from '../../../../../../../../../ui/modules/comma-separated-listing';
import { SlideToken } from '../../definitions';
import { CurrentSpeakerChyronSlideComponent } from './components/current-speaker-chyron-slide.component';
@NgModule({
    declarations: [CurrentSpeakerChyronSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakerChyronSlideComponent }],
    imports: [CommonModule, CommaSeparatedListingComponent]
})
export class CurrentSpeakerChyronSlideModule {}
