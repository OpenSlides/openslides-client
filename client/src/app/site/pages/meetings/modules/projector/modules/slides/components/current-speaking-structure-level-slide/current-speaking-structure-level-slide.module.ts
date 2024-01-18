import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SlideToken } from '../../definitions';
import { CurrentSpeakingStructureLevelSlideComponent } from './components/current-speaking-structure-level-slide.component';
@NgModule({
    imports: [CommonModule],
    declarations: [CurrentSpeakingStructureLevelSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakingStructureLevelSlideComponent }]
})
export class CurrentSpeakingStructureLevelSlideModule {}
