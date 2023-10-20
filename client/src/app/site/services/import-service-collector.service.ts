import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

@Injectable({
    providedIn: `root`
})
export class ImportServiceCollectorService {
    public constructor(
        public readonly matSnackBar: MatSnackBar,
        public readonly translate: TranslateService,
        public readonly papa: Papa
    ) {}
}
