import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { HttpService } from 'src/app/gateways/http.service';

import { SlidesModule } from '../slides.module';

type MediafileCacheEntry = {
    id: Id;
    data: string;
};

@Injectable({ providedIn: SlidesModule })
export class SlideMediafileService {
    private cache: { [projectorId: Id]: MediafileCacheEntry | null } = {};

    public constructor(private http: HttpService) {}

    public async getMediafile(projectorId: Id, id: Id): Promise<MediafileCacheEntry | null> {
        this.cache[projectorId] = { data: null, id }; // Prevent duplicate request of file

        try {
            const file = await this.http.get<Blob>(`/system/media/get/${id}`, {}, { responseType: `blob` });
            // TODO: When mediafile service supports single page retrieval
            //       we might want to cache multiple pages of a file to prevent
            //       rerequesting pages when navigating back.
            //       For now the objects will just be deleted when a new one is
            //       available.
            this.cache[projectorId] = { data: URL.createObjectURL(file), id };
        } catch (e) {
            console.error(e);
            delete this.cache[projectorId];
        }

        return null;
    }

    public getMediafileSync(projectorId: Id, id: Id): MediafileCacheEntry | null {
        if (!this.cache[projectorId] || this.cache[projectorId].id !== id) {
            this.getMediafile(projectorId, id);
            return null;
        }

        return this.cache[projectorId];
    }
}
