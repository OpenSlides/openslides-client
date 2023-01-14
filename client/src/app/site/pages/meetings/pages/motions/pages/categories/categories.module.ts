import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingModule } from 'src/app/ui/modules/sorting';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CategoryDetailSortComponent } from './components/category-detail-sort/category-detail-sort.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryListSortComponent } from './components/category-list-sort/category-list-sort.component';

@NgModule({
    declarations: [
        CategoryListComponent,
        CategoryListSortComponent,
        CategoryDetailComponent,
        CategoryDetailSortComponent
    ],
    imports: [
        CommonModule,
        CategoriesRoutingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatCardModule,
        MatTableModule,
        MatChipsModule,
        MatDividerModule,
        MatInputModule,
        ReactiveFormsModule,
        SortingModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        DirectivesModule,
        ChoiceDialogModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CategoriesModule {}
