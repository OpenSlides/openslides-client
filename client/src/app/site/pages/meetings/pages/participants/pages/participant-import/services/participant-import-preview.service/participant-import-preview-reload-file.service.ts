import { Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Service()
export class ParticipantImportCSVReloadService {
    private readonly csvReload = new Subject<Event>();
    public readonly openFileInput$ = new Observable(file => this.csvReload.subscribe(file));

    public reload(event: Event): void {
        this.csvReload.next(event);
    }
}
