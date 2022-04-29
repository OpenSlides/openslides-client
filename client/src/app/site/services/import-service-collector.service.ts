import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Papa } from 'ngx-papaparse';

@Injectable({
    providedIn: 'root'
})
export class ImportServiceCollectorService {
    public constructor(public readonly translate: TranslateService, public readonly papa: Papa) {}
}
