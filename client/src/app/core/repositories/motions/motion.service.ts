import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'app/core/definitions/key-types';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { MotionForwardDialogComponent } from 'app/site/motions/modules/motion-detail/components/motion-forward-dialog/motion-forward-dialog.component';
import { MotionFormatService } from 'app/site/motions/services/motion-format.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MotionRepositoryService } from './motion-repository.service';

@Injectable({
    providedIn: `root`
})
export class MotionService {
    public constructor(
        private translate: TranslateService,
        private repo: MotionRepositoryService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private motionFormatService: MotionFormatService
    ) {}

    public async forwardMotionsToMeetings(...motions: ViewMotion[]): Promise<void> {
        const dialogRef = this.dialog.open(MotionForwardDialogComponent, {
            ...mediumDialogSettings
        });
        const toMeetingIds = (await dialogRef.afterClosed().toPromise()) as Id[];
        if (toMeetingIds) {
            try {
                const forwardMotions = motions.map(motion => this.motionFormatService.formatMotionForForward(motion));
                await this.repo.createForwarded(toMeetingIds, ...forwardMotions);
                const verboseName = motions.length === 1 ? `motion` : `motions`;
                const message = `${motions.length} ${this.translate.instant(`${verboseName} successfully forwarded`)}`;
                this.snackbar.open(message, `Ok`);
            } catch (e) {
                this.snackbar.open(e.toString(), `Ok`);
            }
        }
    }

    /**
     * Get the label for the motion's current state with the extension
     * attached (if available). For cross-referencing other motions, `[motion:id]`
     * will replaced by the referenced motion's number (see {@link solveExtensionPlaceHolder})
     *
     * @param motion
     * @returns the translated state with the extension attached
     */
    public getExtendedStateLabel(motion: ViewMotion): string {
        if (!motion.state) {
            return null;
        }
        let state = this.translate.instant(motion.state.name);
        if (motion.stateExtension && motion.state.show_state_extension_field) {
            state += ` ` + this.parseMotionPlaceholders(motion.stateExtension);
        }
        return state;
    }

    /**
     * Get the label for the motion's current recommendation with the extension
     * attached (if available)
     *
     * @param motion
     * @returns the translated extension with the extension attached
     */
    public getExtendedRecommendationLabel(motion: ViewMotion): string {
        if (motion.recommendation) {
            let rec = this.translate.instant(motion.recommendation.recommendation_label);
            if (motion.recommendationExtension && motion.recommendation.show_recommendation_extension_field) {
                rec += ` ` + this.parseMotionPlaceholders(motion.recommendationExtension);
            }
            return rec;
        }
        return ``;
    }

    /**
     * Returns an observable for all motions, that referencing the given motion (via id)
     * in the recommendation.
     */
    public getRecommendationReferencingMotions(motionId: number): Observable<ViewMotion[]> {
        return this.repo.getViewModelListObservable().pipe(
            map((motions: ViewMotion[]): ViewMotion[] =>
                motions.filter((motion: ViewMotion): boolean => {
                    if (!motion.recommendationExtension) {
                        return false;
                    }

                    // Check, if this motion has the motionId in it's recommendation
                    const placeholderRegex = /\[motion:(\d+)\]/g;
                    let match;
                    while ((match = placeholderRegex.exec(motion.recommendationExtension))) {
                        if (parseInt(match[1], 10) === motionId) {
                            return true;
                        }
                    }

                    return false;
                })
            )
        );
    }

    /**
     * Replaces any motion placeholder (`[motion:id]`) with the motion's title(s)
     *
     * @param value
     * @returns the string with the motion titles replacing the placeholders
     */
    private parseMotionPlaceholders(value: string): string {
        return value.replace(/\[motion:(\d+)\]/g, (match, id) => {
            const motion = this.repo.getViewModel(id);
            if (motion) {
                return motion.getNumberOrTitle();
            } else {
                return this.translate.instant(`<unknown motion>`);
            }
        });
    }
}
