import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
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
        ChoiceDialogComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CategoriesModule {}
