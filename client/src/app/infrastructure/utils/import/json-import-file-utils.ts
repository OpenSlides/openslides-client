import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

export const WRONG_JSON_IMPORT_FORMAT_ERROR_MSG = _(`Import data needs to have the JSON format`);

export async function getUploadFileJson<ExpectType>(file: FileData, snackbar: MatSnackBar): Promise<ExpectType> {
    const json = await new Promise<ExpectType>(resolve => {
        const reader = new FileReader();
        reader.addEventListener(`load`, progress => {
            let result;
            try {
                result = JSON.parse(progress.target!.result as string);
            } catch (e) {
                snackbar.open(
                    `${this.translate.instant(`Error`)}: ${this.translate.instant(WRONG_JSON_IMPORT_FORMAT_ERROR_MSG)}`,
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
