import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonListOfSpeakersSlideComponent } from './components/common-list-of-speakers-slide.component';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [CommonListOfSpeakersSlideComponent],
    imports: [CommonModule, MatIconModule, OpenSlidesTranslationModule.forChild()],
    exports: [CommonListOfSpeakersSlideComponent]
})
export class CommonListOfSpeakersSlideModule {}
