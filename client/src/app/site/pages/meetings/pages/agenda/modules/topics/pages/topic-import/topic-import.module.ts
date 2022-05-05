import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicImportRoutingModule } from './topic-import-routing.module';
import { TopicImportServiceModule } from './services/topic-import-service.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { ReactiveFormsModule } from '@angular/forms';
import { TopicImportComponent } from './components/topic-import/topic-import.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatInputModule } from '@angular/material/input';

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
