import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';
import { PipesModule } from 'src/app/ui/pipes';

import { StatuteParagraphImportListComponent } from './components/statute-paragraph-import-list/statute-paragraph-import-list.component';
import { StatuteParagraphListComponent } from './components/statute-paragraph-list/statute-paragraph-list.component';
import { StatuteParagraphServiceModule } from './services/statute-paragraph-service.module';
import { StatuteParagraphsRoutingModule } from './statute-paragraphs-routing.module';

@NgModule({
    declarations: [StatuteParagraphListComponent, StatuteParagraphImportListComponent],
    imports: [
        CommonModule,
        StatuteParagraphsRoutingModule,
        StatuteParagraphServiceModule,
        ImportListModule,
        HeadBarModule,
        LegacyEditorModule,
        PipesModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        ScrollingModule,
        ReactiveFormsModule
    ]
})
export class StatuteParagraphsModule {}
