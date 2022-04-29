import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegalNoticeRoutingModule } from './legal-notice-routing.module';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { InfoModule } from 'src/app/site/modules/info';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    declarations: [LegalNoticeComponent],
    imports: [CommonModule, LegalNoticeRoutingModule, InfoModule, OpenSlidesTranslationModule.forChild()]
})
export class LegalNoticeModule {}
