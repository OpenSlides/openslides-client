import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ROUTES } from '@angular/router';

import { SLIDE_MANIFESTS, Slides } from './definitions';

@NgModule({
    declarations: [],
    imports: [CommonModule],
    providers: [
        // provider for Angular CLI to analyze
        { provide: ROUTES, useValue: Slides, multi: true },
        { provide: SLIDE_MANIFESTS, useValue: Slides }
    ]
})
export class SlidesModule {}
