import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { getLongPreview } from 'app/shared/utils/previewStrings';

@Injectable({
    providedIn: `root`
})
export class ErrorService {
    public constructor(private translate: TranslateService, private matSnackBar: MatSnackBar) {}

    public showError = (message: string | Error) => {
        let errorNotification: string;
        if (message instanceof Error) {
            if (message.message) {
                errorNotification = message.message;
            } else {
                errorNotification = this.translate.instant(
                    `A client error occurred. Please contact your system administrator.`
                );
            }
        } else {
            errorNotification = message;
        }
        this.matSnackBar.open(getLongPreview(errorNotification, 1500), this.translate.instant(`OK`), {
            duration: 0
        });
    };
}
