import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CountdownTimeModule } from '../../../countdown-time/countdown-time.module';
import { SlideToken } from '../../definitions';
import { CurrentSpeakingStructureLevelSlideComponent } from './components/current-speaking-structure-level-slide.component';
@NgModule({
    imports: [CommonModule, CountdownTimeModule],
    declarations: [CurrentSpeakingStructureLevelSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakingStructureLevelSlideComponent }]
})
export class CurrentSpeakingStructureLevelSlideModule {}
