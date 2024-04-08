import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { UnsupportedBrowserComponent } from './components/unsupported-browser/unsupported-browser.component';
import { UnsupportedBrowserRoutingModule } from './unsupported-browser-routing.module';

@NgModule({
    declarations: [UnsupportedBrowserComponent],
    imports: [CommonModule, MatCardModule, UnsupportedBrowserRoutingModule, OpenSlidesTranslationModule.forChild()]
})
export class UnsupportedBrowserModule {}
