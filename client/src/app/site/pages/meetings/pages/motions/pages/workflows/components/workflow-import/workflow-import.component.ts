import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';

@Component({
    selector: `os-workflow-import`,
    templateUrl: `./workflow-import.component.html`,
    styleUrls: [`./workflow-import.component.scss`]
})
export class WorkflowImportComponent {
    public constructor(private repo: MotionWorkflowControllerService, private location: Location) {}

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => any {
        return async file => {
            const workflowJson = await new Promise<any[]>(resolve => {
                const reader = new FileReader();
                reader.addEventListener(`load`, progress => {
                    const result = JSON.parse(progress.target!.result as string);
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(workflowJson);
        };
    }
}
