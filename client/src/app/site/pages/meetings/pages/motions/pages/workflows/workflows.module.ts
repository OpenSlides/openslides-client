import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
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
import { FileUploadModule } from 'src/app/ui/modules/file-upload';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules';

import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowDetailSortComponent } from './components/workflow-detail-sort/workflow-detail-sort.component';
import { WorkflowImportComponent } from './components/workflow-import/workflow-import.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { MotionWorkflowServiceModule } from './services';
import { WorkflowsRoutingModule } from './workflows-routing.module';

@NgModule({
    declarations: [
        WorkflowListComponent,
        WorkflowDetailComponent,
        WorkflowImportComponent,
        WorkflowDetailSortComponent,
        WorkflowDetailSortComponent
    ],
    imports: [
        CommonModule,
        WorkflowsRoutingModule,
        MotionWorkflowServiceModule,
        MeetingsComponentCollectorModule,
        FileUploadModule,
        HeadBarModule,
        MatCardModule,
        OpenSlidesTranslationModule.forChild(),
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule,
        MatDialogModule,
        MatDividerModule,
        MatTableModule,
        MatCheckboxModule,
        MatChipsModule,
        MatRippleModule,
        MatInputModule,
        MatTooltipModule,
        FormsModule,
        SortingListModule
    ]
})
export class WorkflowsModule {}
