import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * A service to hold information about the `archive`-status of a meeting.
 * Necessary, because there is a circular dependency if the `ActionService` injects the `ActiveMeetingService`.
 */
@Injectable({
    providedIn: 'root'
})
export class ArchiveStatusService {
    public get isArchived(): boolean {
        return this.isArchivedEvent.value;
    }

    public readonly isArchivedEvent = new BehaviorSubject<boolean>(false);
}
