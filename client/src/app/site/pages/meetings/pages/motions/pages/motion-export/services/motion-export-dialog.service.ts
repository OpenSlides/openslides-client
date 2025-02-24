import { Injectable } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { getMotionDetailSubscriptionConfig } from '../../../motions.subscription';
import { AmendmentControllerService } from '../../../services/common/amendment-controller.service';
import { MotionLineNumberingService } from '../../../services/common/motion-line-numbering.service';
import { ExportFileFormat } from '../../../services/export/definitions';
import { InfoToExport } from '../../../services/export/definitions';
import { MotionExportInfo } from '../../../services/export/motion-export.service';
import { ViewMotion } from '../../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionExportDialogService {
    private _motions!: ViewMotion[];

    public get motions(): ViewMotion[] {
        return this._motions;
    }

    public set motions(value: ViewMotion[]) {
        this._motions = value;
    }

    public constructor(
        private modelRequestService: ModelRequestService,
        private amendmentRepo: AmendmentControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        public formBuilder: UntypedFormBuilder
    ) {}

    public async export(exportInfo: MotionExportInfo, motions: ViewMotion[]): Promise<void> {
        if (exportInfo) {
            await this.modelRequestService.fetch(getMotionDetailSubscriptionConfig(...motions.map(m => m.id)));
            const amendments = this.amendmentRepo.getViewModelList();
            this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);
        }
    }

    // Transform form of type MotionExportInfo into custom form for motion export
    public exportFormToDialogForm(exportInfo: UntypedFormGroup): UntypedFormGroup {
        const dialogForm = this.formBuilder.group({});
        dialogForm.addControl(`format`, exportInfo.get(`format`));
        dialogForm.addControl(`crMode`, exportInfo.get(`crMode`));
        dialogForm.addControl(`lnMode`, exportInfo.get(`lnMode`));
        dialogForm.addControl(`comments`, exportInfo.get(`comments`));

        let intersection = [
            `state`,
            `recommendation`,
            `category`,
            `tags`,
            `block`,
            `polls`,
            `referring_motions`,
            `speakers`
        ].filter(element => exportInfo.get(`metaInfo`).value?.includes(element));
        dialogForm.addControl(`metaInfo`, new FormControl(intersection));

        intersection = [`toc`, `addBreaks`, `continuousText`, `onlyChangedLines`].filter(element =>
            exportInfo.get(`pdfOptions`).value?.includes(element)
        );
        dialogForm.addControl(`pageLayout`, new FormControl(intersection));

        intersection = [`header`, `page`, `date`].filter(element =>
            exportInfo.get(`pdfOptions`).value?.includes(element)
        );
        dialogForm.addControl(`headerFooter`, new FormControl(intersection));

        intersection = [`text`, `reason`, `id`, `attachments`].filter(
            element =>
                exportInfo.get(`content`).value?.includes(element) ||
                exportInfo.get(`metaInfo`).value?.includes(element) ||
                exportInfo.get(`pdfOptions`).value?.includes(element)
        );
        dialogForm.addControl(`content`, new FormControl(intersection));

        intersection = [`submmitters`, `supporters`, `editors`].filter(element =>
            exportInfo.get(`metaInfo`).value?.includes(element)
        );
        dialogForm.addControl(`personrelated`, new FormControl(intersection));

        return dialogForm;
    }

    // Transform form of motion export to MotionExportInfo for further processing
    public dialogToExportForm(dialogForm: UntypedFormGroup): MotionExportInfo {
        const exportInfo = {};

        exportInfo[`format`] = dialogForm.value[`format`] as ExportFileFormat;
        exportInfo[`crMode`] = dialogForm.get(`crMode`).value as ChangeRecoMode;
        exportInfo[`lnMode`] = dialogForm.get(`lnMode`).value as LineNumberingMode;
        exportInfo[`comments`] = dialogForm.get(`comments`).value;
        exportInfo[`content`] = dialogForm.get(`content`).value.filter(obj => !obj.includes(`id`));

        let intersection = [
            `submitters`,
            `supporters`,
            `state`,
            `recommendation`,
            `category`,
            `block`,
            `tags`,
            `polls`,
            `speakers`,
            `sequential_number`,
            `referring_motions`,
            `allcomments`,
            `editors`,
            `working_group_speakers`
        ].filter(
            element =>
                dialogForm.get(`metaInfo`).value.includes(element) ||
                dialogForm.get(`content`).value.includes(element) ||
                dialogForm.get(`personrelated`).value.includes(element)
        );
        exportInfo[`metaInfo`] = intersection as InfoToExport[];

        intersection = [
            `toc`,
            `header`,
            `page`,
            `date`,
            `attachments`,
            `addBreaks`,
            `continuousText`,
            `onlyChangedLines`
        ].filter(
            element =>
                dialogForm.get(`pageLayout`).value.includes(element) ||
                dialogForm.get(`headerFooter`).value.includes(element) ||
                dialogForm.get(`content`).value.includes(element)
        );
        exportInfo[`pdfOptions`] = intersection;

        return exportInfo;
    }
}
