import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { StorageService } from '../../gateways/storage.service';
import { ModelRequestService } from './model-request.service';

@Service()
export class ComponentServiceCollectorService {
    public router = inject(Router);
    public titleService = inject(Title);
    public matSnackBar = inject(MatSnackBar);
    public storage = inject(StorageService);
    public modelRequestService = inject(ModelRequestService);
}
