import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

import { MotionWorkflowControllerService } from '../../../../modules/workflows/services';

export const WRONG_JSON_IMPORT_FORMAT_ERROR_MSG = _(`Import data needs to have the JSON format`);

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
            const workflowJson = await new Promise<any[]>(resolve => {
                const reader = new FileReader();
                reader.addEventListener(`load`, progress => {
                    let result;
                    try {
                        result = JSON.parse(progress.target!.result as string);
                    } catch (e) {
                        this.snackbar.open(
                            `${this.translate.instant(`Error`)}: ${this.translate.instant(
                                WRONG_JSON_IMPORT_FORMAT_ERROR_MSG
                            )}`,
                            `OK`
                        );
                        throw new Error(WRONG_JSON_IMPORT_FORMAT_ERROR_MSG);
                    }
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(workflowJson);
        };
    }
}
