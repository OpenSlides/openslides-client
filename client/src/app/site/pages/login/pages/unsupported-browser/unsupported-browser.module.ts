import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnsupportedBrowserRoutingModule } from './unsupported-browser-routing.module';
import { UnsupportedBrowserComponent } from './components/unsupported-browser/unsupported-browser.component';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [UnsupportedBrowserComponent],
    imports: [CommonModule, MatCardModule, UnsupportedBrowserRoutingModule, OpenSlidesTranslationModule.forChild()]
})
export class UnsupportedBrowserModule {}
