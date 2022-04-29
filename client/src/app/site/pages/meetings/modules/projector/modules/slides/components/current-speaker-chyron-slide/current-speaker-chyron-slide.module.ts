import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideToken } from '../../definitions';
import { CurrentSpeakerChyronSlideComponent } from './components/current-speaker-chyron-slide.component';
@NgModule({
    imports: [CommonModule],
    declarations: [CurrentSpeakerChyronSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakerChyronSlideComponent }]
})
export class CurrentSpeakerChyronSlideModule {}
