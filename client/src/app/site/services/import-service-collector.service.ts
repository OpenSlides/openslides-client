import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

@Service()
export class ImportServiceCollectorService {
    public readonly matSnackBar = inject(MatSnackBar);
    public readonly translate = inject(TranslateService);
    public readonly papa = inject(Papa);
}
