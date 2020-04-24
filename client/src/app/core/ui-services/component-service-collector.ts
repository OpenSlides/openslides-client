import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { AutoupdateService } from '../core-services/autoupdate.service';
import { ModelRequestBuilderService } from '../core-services/model-request-builder.service';
import { StorageService } from '../core-services/storage.service';

@Injectable({
    providedIn: 'root'
})
export class ComponentServiceCollector {
    public constructor(
        public titleService: Title,
        public translate: TranslateService,
        public matSnackBar: MatSnackBar,
        public autoupdateService: AutoupdateService,
        public storage: StorageService
    ) {}
}
