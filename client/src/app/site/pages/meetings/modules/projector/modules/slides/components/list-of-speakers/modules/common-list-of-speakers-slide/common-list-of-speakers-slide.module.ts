import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { CommonListOfSpeakersSlideComponent } from './components/common-list-of-speakers-slide.component';

@NgModule({
    declarations: [CommonListOfSpeakersSlideComponent],
    imports: [CommonModule, MatIconModule, OpenSlidesTranslationModule.forChild()],
    exports: [CommonListOfSpeakersSlideComponent]
})
export class CommonListOfSpeakersSlideModule {}
