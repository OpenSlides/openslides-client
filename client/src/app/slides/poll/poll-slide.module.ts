import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { SlideToken } from 'app/slides/slide-token';
import { PollSlideComponent } from './poll-slide.component';
@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [PollSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: PollSlideComponent }]
})
export class PollSlideModule {}
