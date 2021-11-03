import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';
import { MotionWorkflowAction } from 'app/core/actions/motion-workflow-action';

import { MotionWorkflowRepositoryService } from '../../../../../../core/repositories/motions/motion-workflow-repository.service';
import { FileData } from '../../../../../../shared/components/file-upload/file-upload.component';

@Component({
    templateUrl: `./workflow-import.component.html`,
    styleUrls: [`./workflow-import.component.scss`]
})
export class WorkflowImportComponent {
    public columns: PblColumnDefinition[] = [
        {
            prop: `title`,
            label: _(`Title`)
        }
    ];

    public constructor(private repo: MotionWorkflowRepositoryService, private location: Location) {}

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => any {
        return async file => {
            const workflowJson = await new Promise<MotionWorkflowAction.ImportPayload[]>(resolve => {
                const reader = new FileReader();
                reader.addEventListener(`load`, progress => {
                    const result = JSON.parse(progress.target.result as string);
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(workflowJson);
        };
    }
}
