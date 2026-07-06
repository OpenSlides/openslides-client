import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

export const WRONG_JSON_IMPORT_FORMAT_ERROR_MSG = _(`Import data needs to have the JSON format`);

@Injectable({
    providedIn: `root`
})
export class UploadFileJsonProcessorService {
    private snackbar = inject(MatSnackBar);
    private translate = inject(TranslateService);

    public async getUploadFileJson<ExpectType>(file: FileData): Promise<ExpectType> {
        const json = await new Promise<ExpectType>(resolve => {
            const reader = new FileReader();
            reader.addEventListener(`load`, progress => {
                let result: any;
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
        return json;
    }
}
