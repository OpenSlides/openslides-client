import { inject, Injectable } from '@angular/core';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { getMotionDetailSubscriptionConfig } from '../../../motions.subscription';
import { AmendmentControllerService } from '../../../services/common/amendment-controller.service';
import { MotionLineNumberingService } from '../../../services/common/motion-line-numbering.service';
import { MotionExportInfo } from '../../../services/export/motion-export.service';
import { MotionExportService } from '../../../services/export/motion-export.service';
import { ViewMotion } from '../../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionExportDialogService {
    private exportService = inject(MotionExportService);
    private modelRequestService = inject(ModelRequestService);
    private motionRepo = inject(MotionRepositoryService);
    private amendmentRepo = inject(AmendmentControllerService);
    private motionLineNumbering = inject(MotionLineNumberingService);
    private _motions!: ViewMotion[];

    public get motions(): ViewMotion[] {
        return this._motions;
    }

    public set motions(value: ViewMotion[]) {
        this._motions = value;
    }

    public constructor() {}

    public async export(exportInfo: MotionExportInfo): Promise<void> {
        if (exportInfo) {
            await this.modelRequestService.fetch(getMotionDetailSubscriptionConfig(...this.motions.map(m => m.id)));
            const amendments = this.amendmentRepo.getViewModelList();
            this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);

            // The timeout is needed for the repos to update their view model list subjects
            setTimeout(() => {
                this.exportService.evaluateExportRequest(
                    exportInfo,
                    this.motions.map(m => this.motionRepo.getViewModel(m.id))
                );
            }, 2000);
        }
    }
}
