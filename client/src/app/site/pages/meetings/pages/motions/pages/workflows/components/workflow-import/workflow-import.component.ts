import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { UploadFileJsonProcessorService } from 'src/app/infrastructure/utils/import/json-import-file-utils';
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
        private uploadFileProcessor: UploadFileJsonProcessorService
    ) {}

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => any {
        return async file => {
            const workflowJson = await this.uploadFileProcessor.getUploadFileJson<any[]>(file);
            return this.repo.import(workflowJson);
        };
    }
}
