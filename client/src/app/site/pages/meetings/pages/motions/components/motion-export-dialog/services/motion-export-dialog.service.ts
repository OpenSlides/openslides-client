import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { firstValueFrom } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ChangeRecoMode, LineNumberingMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { ExportDialogService, ExportDialogSettings } from 'src/app/ui/modules/export-dialog';

import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { getMotionDetailSubscriptionConfig } from '../../../motions.subscription';
import { AmendmentControllerService } from '../../../services/common/amendment-controller.service';
import { MotionLineNumberingService } from '../../../services/common/motion-line-numbering.service';
import {
    ExportFileFormat,
    InfoToExport,
    motionImportExportHeaderOrder,
    noMetaData
} from '../../../services/export/definitions';
import { MotionExportInfo } from '../../../services/export/motion-export.service';
import { MotionExportService } from '../../../services/export/motion-export.service';
import { ViewMotion } from '../../../view-models';
import { MotionExportDialogModule } from '../motion-export-dialog.module';

@Injectable({
    providedIn: MotionExportDialogModule
})
export class MotionExportDialogService extends ExportDialogService<ViewMotion, MotionExportInfo> {
    protected override get settings(): ExportDialogSettings<MotionExportInfo> {
        return {
            title: _(`Export Motions`),
            settings: {
                format: {
                    label: _(`Format`),
                    weight: 1,
                    multiple: false,
                    choices: new Map([
                        [ExportFileFormat.PDF, { label: _(`PDF`) }],
                        [ExportFileFormat.CSV, { label: _(`CSV`) }],
                        [ExportFileFormat.XLSX, { label: _(`XLSX`) }]
                    ])
                },
                lnMode: {
                    label: _(`Line Numbering`),
                    weight: 2,
                    multiple: false,
                    offState: LineNumberingMode.None,
                    disableForFormat: [ExportFileFormat.CSV, ExportFileFormat.XLSX],
                    choices: new Map([
                        [LineNumberingMode.None, { label: _(`None`) }],
                        [LineNumberingMode.Outside, { label: _(`Outside`) }]
                    ])
                },
                crMode: {
                    label: _(`Change Recommendations`),
                    weight: 3,
                    multiple: false,
                    offState: ChangeRecoMode.Original,
                    disableForFormat: [ExportFileFormat.CSV, ExportFileFormat.XLSX],
                    choices: new Map([
                        [ChangeRecoMode.Original, { label: _(`Original Version`) }],
                        [ChangeRecoMode.Changed, { label: _(`Changed Version`) }],
                        [ChangeRecoMode.Diff, { label: _(`Diff Version`) }],
                        [ChangeRecoMode.ModifiedFinal, { label: _(`Final Version`) }]
                    ])
                },
                content: {
                    label: _(`Content`),
                    weight: 4,
                    multiple: true,
                    choices: new Map([
                        [`text`, { label: _(`Text`) }],
                        [`reason`, { label: _(`Reason`) }]
                    ])
                },
                metaInfo: {
                    label: _(`Meta Information`),
                    weight: 5,
                    multiple: true,
                    disableForFormat: [ExportFileFormat.CSV, ExportFileFormat.XLSX],
                    choices: new Map(
                        (
                            (
                                motionImportExportHeaderOrder.filter(
                                    metaData => !noMetaData.some(noMeta => metaData === noMeta)
                                ) as InfoToExport[]
                            ).map(date => [date, { label: this.getLabelForMetadata(date) }]) as [InfoToExport, any][]
                        ).concat([
                            [
                                `speakers`,
                                {
                                    label: _(`Speakers`),
                                    perms: Permission.listOfSpeakersCanSee,
                                    disableForFormat: [ExportFileFormat.CSV],
                                    changeStateForFormat: [
                                        { format: [ExportFileFormat.XLSX], value: false },
                                        { format: [ExportFileFormat.PDF, ExportFileFormat.CSV], value: true }
                                    ]
                                }
                            ],
                            [
                                `polls`,
                                {
                                    label: _(`Voting Result`),
                                    disableForFormat: [ExportFileFormat.CSV, ExportFileFormat.XLSX]
                                }
                            ]
                        ])
                    )
                },
                pdfOptions: {
                    label: _(`PDF options`),
                    weight: 5,
                    multiple: true,
                    choices: new Map<string, any>([
                        [
                            `toc`,
                            {
                                label: _(`Table of contents`),
                                disableWhen: [{ otherValue: `continuousText`, checked: true }]
                            }
                        ],
                        [`header`, { label: _(`Header`) }],
                        [`page`, { label: _(`Page numbers`) }],
                        [`date`, { label: _(`Current date`) }],
                        [`attachments`, { label: _(`Attachments`) }],
                        [
                            `addBreaks`,
                            {
                                label: _(`Enforce page breaks`),
                                disableWhen: [{ otherValue: `continuousText`, checked: true }]
                            }
                        ],
                        [`continuousText`, { label: _(`Continuous text`) }]
                    ])
                },
                comments: {
                    label: _(`Comments`),
                    weight: 6,
                    multiple: true,
                    choices: new Map(
                        ([[PERSONAL_NOTE_ID, { label: _(`Personal note`) }]] as [number, { label: string }][]).concat(
                            this.commentRepo.getViewModelList().map(comment => [comment.id, { label: comment.name }])
                        )
                    )
                }
            }
        };
    }
    protected override readonly storageKey: string = `motions`;
    protected override get defaults(): MotionExportInfo {
        return {
            format: ExportFileFormat.PDF,
            lnMode: this.meetingSettings.instant(`motions_default_line_numbering`)!,
            crMode: ChangeRecoMode.Diff,
            content: [`text`, `reason`],
            metaInfo: [`submitters`, `category`, `tags`, `block`, `recommendation`, `state`, `polls`],
            pdfOptions: [`toc`, `header`, `page`, `addBreaks`],
            comments: []
        };
    }

    public constructor(
        dialog: MatDialog,
        private exportService: MotionExportService,
        private modelRequestService: ModelRequestService,
        private motionRepo: MotionRepositoryService,
        private amendmentRepo: AmendmentControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        private meetingSettings: MeetingSettingsService,
        public commentRepo: MotionCommentSectionControllerService
    ) {
        super(dialog);
    }

    // public override async open(data: ViewMotion[]): Promise<MatDialogRef<MotionExportDialogComponent, MotionExportInfo>> {
    //     const module = await import(`../motion-export-dialog.module`).then(m => m.MotionExportDialogModule);
    //     return this.dialog.open(module.getComponent(), { data, ...largeDialogSettings });
    // }

    public async export(motions: ViewMotion[]): Promise<void> {
        const dialogRef = await this.open(motions);
        const exportInfo = await firstValueFrom(dialogRef.afterClosed());

        if (exportInfo) {
            await this.modelRequestService.fetch(getMotionDetailSubscriptionConfig(...motions.map(m => m.id)));
            const amendments = this.amendmentRepo.getViewModelList();
            this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);

            // The timeout is needed for the repos to update their view model list subjects
            setTimeout(() => {
                this.exportService.evaluateExportRequest(
                    exportInfo,
                    motions.map(m => this.motionRepo.getViewModel(m.id))
                );
            }, 2000);
        }
    }

    /**
     * Gets the untranslated label for metaData
     */
    private getLabelForMetadata(metaDataName: string): string {
        switch (metaDataName) {
            case `polls`: {
                return `Voting result`;
            }
            case `id`: {
                return `Sequential number`;
            }
            case `block`: {
                return `Motion block`;
            }
            default: {
                return metaDataName.charAt(0).toUpperCase() + metaDataName.slice(1).replace(`_`, ` `);
            }
        }
    }
}
