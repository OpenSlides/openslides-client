import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

import { TopicImportComponent } from './components/topic-import/topic-import.component';
import { TopicImportMainComponent } from './components/topic-import-main/topic-import-main.component';
import { TopicImportServiceModule } from './services/topic-import-service.module';
import { TopicImportRoutingModule } from './topic-import-routing.module';

@NgModule({
    declarations: [TopicImportComponent, TopicImportMainComponent],
    imports: [
        CommonModule,
        TopicImportRoutingModule,
        TopicImportServiceModule,
        HeadBarModule,
        ImportListModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class TopicImportModule {}
