import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ErrorMainComponent } from './components/error-main/error-main.component';
import { ErrorRoutingModule } from './error-routing.module';

@NgModule({
    declarations: [ErrorMainComponent],
    imports: [CommonModule, ErrorRoutingModule, OpenSlidesTranslationModule.forChild(), MatButtonModule]
})
export class ErrorModule {}
