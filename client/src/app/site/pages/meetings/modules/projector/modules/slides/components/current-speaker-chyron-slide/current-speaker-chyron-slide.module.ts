import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommaSeparatedListingModule } from '../../../../../../../../../ui/modules/comma-separated-listing/comma-separated-listing.module';
import { SlideToken } from '../../definitions';
import { CurrentSpeakerChyronSlideComponent } from './components/current-speaker-chyron-slide.component';
@NgModule({
    declarations: [CurrentSpeakerChyronSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakerChyronSlideComponent }],
    imports: [CommonModule, CommaSeparatedListingModule]
})
export class CurrentSpeakerChyronSlideModule {}
