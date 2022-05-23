import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CountdownTimeModule } from '../../../countdown-time/countdown-time.module';
import { SlideToken } from '../../definitions';
import { CountdownSlideComponent } from './components/projector-countdown-slide.component';

@NgModule({
    imports: [CommonModule, CountdownTimeModule],
    declarations: [CountdownSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: CountdownSlideComponent }]
})
export class ProjectorCountdownSlideModule {}
