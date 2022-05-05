import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowImportComponent } from './components/workflow-import/workflow-import.component';
import { FileUploadModule } from 'src/app/ui/modules/file-upload';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MotionWorkflowCommonServiceModule } from '../../modules/workflows/motion-workflow-common-service.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MotionWorkflowServiceModule } from './services';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [WorkflowListComponent, WorkflowDetailComponent, WorkflowImportComponent],
    imports: [
        CommonModule,
        WorkflowsRoutingModule,
        MotionWorkflowCommonServiceModule,
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
        FormsModule
    ]
})
export class WorkflowsModule {}
