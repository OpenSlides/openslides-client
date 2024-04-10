import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from 'src/app/gateways/storage.service';

@Injectable({ providedIn: `root` })
export class AutopilotService {
    private disabledContentElementsSubject = new BehaviorSubject<{ [key: string]: boolean }>({});

    public get disabledContentElements(): Observable<{ [key: string]: boolean }> {
        return this.disabledContentElementsSubject;
    }

    public constructor(private storage: StorageService) {
        this.storage.get<{ [key: string]: boolean }>(`autopilot-disabled`).then(keys => {
            this.disabledContentElementsSubject.next(keys || {});
        });
    }

    public async updateContentElementVisibility(key: string, status: boolean): Promise<void> {
        const disabledContentElements = this.disabledContentElementsSubject.getValue() || {};
        disabledContentElements[key] = status;
        this.disabledContentElementsSubject.next(disabledContentElements);
        await this.storage.set(`autopilot-disabled`, disabledContentElements);
    }
}
