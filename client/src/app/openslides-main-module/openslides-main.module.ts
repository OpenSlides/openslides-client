import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OpenSlidesMainRoutingModule } from './openslides-main-routing.module';
import { ThemeService } from '../site/services/theme.service';

@NgModule({
    declarations: [],
    imports: [CommonModule, OpenSlidesMainRoutingModule]
})
export class OpenSlidesMainModule {
    public constructor(_themeService: ThemeService) {}
}
