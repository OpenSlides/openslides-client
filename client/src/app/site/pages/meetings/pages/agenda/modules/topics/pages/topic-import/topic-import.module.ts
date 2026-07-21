import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ImportListModule } from '@app/ui/modules/import-list';
import { SpinnerModule } from '@app/ui/modules/spinner';

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
        MatIconModule,
        MatTooltipModule,
        SpinnerModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class TopicImportModule {}
