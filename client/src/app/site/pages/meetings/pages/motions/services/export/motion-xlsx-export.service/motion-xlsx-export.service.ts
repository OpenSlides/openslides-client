import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Workbook } from 'exceljs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { CellFillingDefinition, XlsxExportService } from 'src/app/gateways/export/xlsx-export.service';
import { reconvertChars, stripHtmlTags } from 'src/app/infrastructure/utils';

import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { ViewMotion } from '../../../view-models';
import { MotionControllerService } from '../../common/motion-controller.service';
import { InfoToExport, sortMotionPropertyList } from '../definitions';
import { MotionsExportModule } from '../motions-export.module';

interface MotionXlsxExportConfig {
    motions: ViewMotion[];
    infoToExport?: InfoToExport[];
    commentIds?: Ids;
}

/**
 * Service to export motion elements to XLSX
 */
@Injectable({
    providedIn: MotionsExportModule
})
export class MotionXlsxExportService {
    /**
     * Determine the default font size
     */
    private fontSize = 12;

    /**
     * The defa
     */
    private fontName = `Arial`;

    /**
     * Defines the head row style
     */
    private headRowFilling: CellFillingDefinition = {
        type: `pattern`,
        pattern: `solid`,
        fgColor: {
            argb: `FFFFE699`
        },
        bgColor: {
            argb: `FFFFE699`
        }
    };

    /**
     * Filling Style of odd rows
     */
    private oddFilling: CellFillingDefinition = {
        type: `pattern`,
        pattern: `solid`,
        fgColor: {
            argb: `FFDDDDDD`
        },
        bgColor: {
            argb: `FFDDDDDD`
        }
    };

    public constructor(
        private xlsx: XlsxExportService,
        private translate: TranslateService,
        private motionService: MotionControllerService,
        private commentRepo: MotionCommentSectionControllerService
    ) {}

    /**
     * Export motions as XLSX
     *
     * @param motions
     * @param infoToExport
     * @param comments The ids of the comments, that will be exported, too.
     */
    public exportMotionList({ motions, infoToExport = [], commentIds }: MotionXlsxExportConfig): void {
        const workbook = new Workbook();
        const properties: string[] = infoToExport.includes(`speakers`)
            ? sortMotionPropertyList([`number`, `title`].concat(infoToExport)).concat(`speakers`)
            : sortMotionPropertyList([`number`, `title`].concat(infoToExport));

        const worksheet = workbook.addWorksheet(this.translate.instant(`Motions`), {
            pageSetup: {
                paperSize: 9,
                orientation: `landscape`,
                fitToPage: true,
                fitToHeight: 5,
                fitToWidth: properties.length,
                printTitlesRow: `1:1`,
                margins: {
                    left: 0.4,
                    right: 0.4,
                    top: 1.0,
                    bottom: 0.5,
                    header: 0.3,
                    footer: 0.3
                }
            }
        });

        const columns = [];
        columns.push(
            ...properties.map(property => {
                let propertyHeader = ``;
                switch (property) {
                    case `block`:
                        propertyHeader = `Motion block`;
                        break;
                    case `speakers`:
                        propertyHeader = `Open requests to speak`;
                        break;
                    default:
                        propertyHeader = property.charAt(0).toUpperCase() + property.slice(1).replace(`_`, ` `);
                }
                return {
                    header: this.translate.instant(propertyHeader)
                };
            })
        );
        if (commentIds) {
            columns.push(
                ...commentIds.map(commentId => ({
                    header:
                        commentId === PERSONAL_NOTE_ID
                            ? this.translate.instant(`Personal note`)
                            : this.commentRepo.getViewModel(commentId)!.getTitle()
                }))
            );
        }

        worksheet.columns = columns;

        worksheet.getRow(1).eachCell(cell => {
            cell.font = {
                name: this.fontName,
                size: this.fontSize,
                underline: true,
                bold: true
            };
            cell.fill = this.headRowFilling;
        });

        // map motion data to properties
        const motionData = motions.map(motion => {
            const data = [];
            data.push(
                ...properties.map(property => {
                    const motionProp = motion[property as keyof ViewMotion];
                    /*if (property === 'speakers') {
                        return motion.listOfSpeakers && motion.listOfSpeakers.waitingSpeakerAmount > 0
                            ? motion.listOfSpeakers.waitingSpeakerAmount
                            : '';
                    }*/
                    if (!motionProp) {
                        return ``;
                    }
                    switch (property) {
                        case `state`:
                            return this.motionService.getExtendedStateLabel(motion);
                        case `recommendation`:
                            return this.motionService.getExtendedRecommendationLabel(motion);
                        default:
                            return this.translate.instant(motionProp.toString());
                    }
                })
            );
            if (commentIds) {
                data.push(
                    ...commentIds.map(commentId => {
                        if (commentId === PERSONAL_NOTE_ID) {
                            return motion && motion.getPersonalNote()! && motion.getPersonalNote()!.note;
                        } else {
                            const section = this.commentRepo.getViewModel(commentId)!;
                            const motionComment = motion.getCommentForSection(section);
                            return motionComment && motionComment.comment
                                ? reconvertChars(stripHtmlTags(motionComment.comment))
                                : ``;
                        }
                    })
                );
            }
            return data;
        });

        // add to sheet
        for (let i = 0; i < motionData.length; i++) {
            const row = worksheet.addRow(motionData[i]);
            row.eachCell(cell => {
                cell.alignment = { vertical: `middle`, horizontal: `left`, wrapText: true };
                cell.font = {
                    name: this.fontName,
                    size: this.fontSize
                };
                // zebra styled filling
                if (i % 2 !== 0) {
                    cell.fill = this.oddFilling;
                }
            });
        }

        this.xlsx.autoSize(worksheet, 0);
        this.xlsx.saveXlsx(workbook, this.translate.instant(`Motions`));
    }
}
