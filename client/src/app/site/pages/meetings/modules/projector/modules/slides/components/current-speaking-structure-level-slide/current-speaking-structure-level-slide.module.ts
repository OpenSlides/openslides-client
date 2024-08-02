import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes';

import { CountdownTimeModule } from '../../../countdown-time/countdown-time.module';
import { SlideToken } from '../../definitions';
import { CurrentSpeakingStructureLevelSlideComponent } from './components/current-speaking-structure-level-slide.component';
@NgModule({
    imports: [CommonModule, CountdownTimeModule, MatIconModule, PipesModule, OpenSlidesTranslationModule.forChild()],
    declarations: [CurrentSpeakingStructureLevelSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentSpeakingStructureLevelSlideComponent }]
})
export class CurrentSpeakingStructureLevelSlideModule {}
