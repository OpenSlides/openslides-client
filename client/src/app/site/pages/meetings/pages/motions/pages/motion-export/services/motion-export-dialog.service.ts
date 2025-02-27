import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

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
            `list_of_speakers`,
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
