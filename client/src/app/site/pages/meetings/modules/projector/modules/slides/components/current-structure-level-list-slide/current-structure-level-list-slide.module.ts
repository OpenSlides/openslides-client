import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { SlideToken } from '../../definitions/slide-token';
import { CurrentStructureLevelListSlideComponent } from './components/current-structure-level-list-slide.component';

@NgModule({
    imports: [CommonModule, OpenSlidesTranslationModule.forChild()],
    declarations: [CurrentStructureLevelListSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CurrentStructureLevelListSlideComponent }]
})
export class CurrentStructureLevelListSlideModule {}
