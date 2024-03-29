import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { SlideToken } from '../../definitions';
import { AgendaItemListSlideComponent } from './components/agenda-item-list-slide/agenda-item-list-slide.component';
@NgModule({
    imports: [CommonModule, OpenSlidesTranslationModule.forChild()],
    declarations: [AgendaItemListSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: AgendaItemListSlideComponent }]
})
export class AgendaItemListSlideModule {}
