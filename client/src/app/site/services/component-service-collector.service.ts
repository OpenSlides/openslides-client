import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { StorageService } from '../../gateways/storage.service';
import { ModelRequestService } from './model-request.service';

@Injectable({
    providedIn: `root`
})
export class ComponentServiceCollectorService {
    public constructor(
        public router: Router,
        public titleService: Title,
        public matSnackBar: MatSnackBar,
        public storage: StorageService,
        public modelRequestService: ModelRequestService
    ) {}
}
