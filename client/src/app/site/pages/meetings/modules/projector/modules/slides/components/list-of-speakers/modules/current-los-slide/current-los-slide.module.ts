import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SlideToken } from '../../../../definitions';
import { CommonListOfSpeakersSlideModule } from '../common-list-of-speakers-slide/common-list-of-speakers-slide.module';
import { CommonListOfSpeakersSlideComponent } from '../common-list-of-speakers-slide/components/common-list-of-speakers-slide.component';

@NgModule({
    imports: [CommonModule, CommonListOfSpeakersSlideModule],
    providers: [{ provide: SlideToken.token, useValue: CommonListOfSpeakersSlideComponent }]
})
export class CurrentLosSlideModule {}
