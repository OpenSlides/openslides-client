import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { getUploadFileJson } from 'src/app/infrastructure/utils/import/json-import-file-utils';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';

@Component({
    selector: `os-workflow-import`,
    templateUrl: `./workflow-import.component.html`,
    styleUrls: [`./workflow-import.component.scss`]
})
export class WorkflowImportComponent {
    public constructor(
        private repo: MotionWorkflowControllerService,
        private location: Location,
        private snackbar: MatSnackBar,
        private translate: TranslateService
    ) {}

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => any {
        return async file => {
            const workflowJson = await getUploadFileJson<any[]>(file, this.snackbar, this.translate);
            return this.repo.import(workflowJson);
        };
    }
}
