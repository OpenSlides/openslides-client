import { Injectable } from '@angular/core';

import { HistoryService, Position } from './history.service';

/**
 * Service to enable browsing OpenSlides in a previous version.
 *
 * This is a big TODO. This service and the history service should be combined.
 * Whats to do for adding a history-mode:
 * - restart the communication. The autoupdate service should accept a position (integer).
 *   This position selected should be passed to every autoupdate
 * - Block all meeting editing in the http/action service
 * - Deal with presenters
 * - Do not activate the ICC
 * - Listen to the active meeting service: If the meeting is changed (also to null),
 *   the history mode has to be left
 * - Freeze the operator: It must not listen to updates from the autoupdate. Why?
 *   Maybe the operator had different perms (or wans't even assigned to this meeting).
 *   This would break the capability of this user to freely navigate.
 */
@Injectable({
    providedIn: `root`
})
export class TimeTravelService {
    public constructor(private historyService: HistoryService) {}

    /**
     * Main entry point to set OpenSlides to another history point.
     *
     * @param position the desired point in the history of OpenSlides
     */
    public loadHistoryPoint(position: Position): void {
        this.stopTime(position);
    }

    /**
     * Leaves the history mode.
     */
    public resumeTime(): void {
        this.historyService.leaveHistoryMode();
    }

    private stopTime(position: Position): void {
        this.historyService.enterHistoryMode(position);
    }
}
