import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

/**
 * Service collector for import services
 */
@Injectable({ providedIn: `root` })
export class ImportServiceCollector {
    public constructor(
        public readonly translate: TranslateService,
        public readonly matSnackBar: MatSnackBar,
        public readonly papa: Papa
    ) {}
}
