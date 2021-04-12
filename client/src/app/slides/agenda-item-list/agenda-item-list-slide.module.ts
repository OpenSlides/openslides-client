import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ItemListSlideComponent } from './agenda-item-list-slide.component';
import { SharedModule } from 'app/shared/shared.module';
import { SlideToken } from 'app/slides/slide-token';
@NgModule({
    imports: [CommonModule, SharedModule],
    declarations: [ItemListSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: ItemListSlideComponent }]
})
export class ItemListSlideModule {}
