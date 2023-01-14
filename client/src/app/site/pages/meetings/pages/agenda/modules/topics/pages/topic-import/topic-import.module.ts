import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

import { TopicImportComponent } from './components/topic-import/topic-import.component';
import { TopicImportServiceModule } from './services/topic-import-service.module';
import { TopicImportRoutingModule } from './topic-import-routing.module';

@NgModule({
    declarations: [TopicImportComponent],
    imports: [
        CommonModule,
        TopicImportRoutingModule,
        TopicImportServiceModule,
        HeadBarModule,
        ImportListModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ]
})
export class TopicImportModule {}
