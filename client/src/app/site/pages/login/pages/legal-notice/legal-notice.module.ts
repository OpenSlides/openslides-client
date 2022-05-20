import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InfoModule } from 'src/app/site/modules/info';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { LegalNoticeRoutingModule } from './legal-notice-routing.module';

@NgModule({
    declarations: [LegalNoticeComponent],
    imports: [CommonModule, LegalNoticeRoutingModule, InfoModule, OpenSlidesTranslationModule.forChild()]
})
export class LegalNoticeModule {}
