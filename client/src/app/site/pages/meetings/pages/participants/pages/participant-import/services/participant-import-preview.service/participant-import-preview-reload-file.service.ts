import { Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { observeNotification } from 'rxjs/internal/Notification';

@Service()
export class ParticipantImportCSVReloadService {
    private readonly csvReload = new Subject<void>();
    readonly openFileInput$ = new Observable(file => this.csvReload.subscribe(file));

    reload(): void {
        this.csvReload.next();
    }
}
