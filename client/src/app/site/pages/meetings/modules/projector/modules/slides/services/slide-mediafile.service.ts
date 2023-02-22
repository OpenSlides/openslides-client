import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { SlidesModule } from '../slides.module';

@Injectable({ providedIn: SlidesModule })
export class SlideMediafileService {
    public constructor() {}

    public getMediafile(id: Id) {
        // TODO: Download, cache and return something else
        return `/system/media/get/${id}`;
    }
}
