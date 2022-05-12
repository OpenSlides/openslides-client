import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorRoutingModule } from './error-routing.module';
import { ErrorMainComponent } from './components/error-main/error-main.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [ErrorMainComponent],
    imports: [CommonModule, ErrorRoutingModule, OpenSlidesTranslationModule.forChild(), MatButtonModule]
})
export class ErrorModule {}
