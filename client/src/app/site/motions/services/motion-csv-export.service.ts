import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import {
    CsvColumnDefinitionMap,
    CsvColumnDefinitionProperty,
    CsvExportService
} from 'app/core/ui-services/csv-export.service';
import { LinenumberingService } from 'app/core/ui-services/linenumbering.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { reconvertChars } from 'app/shared/utils/reconvert-chars';
import { stripHtmlTags } from 'app/shared/utils/strip-html-tags';
import { MotionCsvExportExample } from '../export/motion-csv-export-example';
import { MotionFormatService } from './motion-format.service';
import { ChangeRecoMode, getMotionExportHeadersAndVerboseNames, sortMotionPropertyList } from '../motions.constants';
import { ViewMotion } from '../models/view-motion';

export interface MotionCsvExport {
    number?: string;
    submitters?: string;
    title: string;
    text: string;
    reason?: string;
    category?: string;
    motion_block?: string;
    supporters?: string;
    tags?: string;
}

/**
 * Exports CSVs for motions. Collect all CSV types here to have them in one place.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionCsvExportService {
    public constructor(
        private csvExport: CsvExportService,
        private translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private linenumberingService: LinenumberingService,
        private motionService: MotionService,
        private motionFormatService: MotionFormatService,
        private commentRepo: MotionCommentSectionRepositoryService
    ) {}

    /**
     * Creates the motion text
     *
     * @param motion the motion to convert to pdf
     * @param crMode determine the used change Recommendation mode
     * @returns doc def for the "the assembly may decide" preamble
     */
    private createText(motion: ViewMotion, crMode: ChangeRecoMode): string {
        // get the line length from the config
        const lineLength = this.meetingSettingsService.instant('motions_line_length');
        const changes = this.motionFormatService.getUnifiedChanges(motion, lineLength);
        const text = this.motionFormatService.formatMotion(motion, crMode, changes, lineLength);
        const strippedLines = this.linenumberingService.stripLineNumbers(text);
        return strippedLines;
    }

    /**
     * Export all motions as CSV
     *
     * @param motions Motions to export
     * @param contentToExport content properties to export
     * @param crMode
     */
    public exportMotionList(
        motions: ViewMotion[],
        contentToExport: string[],
        comments: number[],
        crMode?: ChangeRecoMode
    ): void {
        if (!crMode) {
            crMode = this.meetingSettingsService.instant('motions_recommendation_text_mode');
        }

        const properties = sortMotionPropertyList(['number', 'title'].concat(contentToExport));
        const exportProperties: (
            | CsvColumnDefinitionProperty<ViewMotion>
            | CsvColumnDefinitionMap<ViewMotion>
        )[] = properties.map(option => {
            if (option === 'recommendation') {
                return {
                    label: 'recommendation',
                    map: motion => this.motionService.getExtendedRecommendationLabel(motion)
                };
            } else if (option === 'state') {
                return {
                    label: 'state',
                    map: motion => this.motionService.getExtendedStateLabel(motion)
                };
            } else if (option === 'text') {
                return {
                    label: 'Text',
                    map: motion => this.createText(motion, crMode)
                };
            } else if (option === 'block') {
                return {
                    label: 'Motion block',
                    map: motion => (motion.block ? motion.block.getTitle() : '')
                };
            } else {
                return { property: option } as CsvColumnDefinitionProperty<ViewMotion>;
            }
        });
        exportProperties.push(
            ...comments.map(commentId => ({
                label: this.commentRepo.getViewModel(commentId).getTitle(),
                map: (motion: ViewMotion) => {
                    const viewComment = this.commentRepo.getViewModel(commentId);
                    const motionComment = motion.getCommentForSection(viewComment);
                    return motionComment && motionComment.comment
                        ? reconvertChars(stripHtmlTags(motionComment.comment))
                        : '';
                }
            }))
        );

        this.csvExport.export(motions, exportProperties, this.translate.instant('Motions') + '.csv');
    }
    /**numberOrTitle
     * Exports the call list.
     *
     * @param motions All motions in the CSV. They should be ordered by weight correctly.
     */
    public exportCallList(motions: ViewMotion[]): void {
        this.csvExport.export(
            motions,
            [
                { label: 'Called', map: motion => (motion.sort_parent_id ? '' : motion.numberOrTitle) },
                { label: 'Called with', map: motion => (!motion.sort_parent_id ? '' : motion.numberOrTitle) },
                { label: 'submitters', map: motion => motion.submittersAsUsers.map(s => s.short_name).join(',') },
                { property: 'title' },
                {
                    label: 'recommendation',
                    map: motion =>
                        motion.recommendation ? this.motionService.getExtendedRecommendationLabel(motion) : ''
                },
                { property: 'block', label: 'Motion block' }
            ],
            this.translate.instant('Call list') + '.csv'
        );
    }

    public exportDummyMotion(): void {
        const rows: MotionCsvExport[] = MotionCsvExportExample;
        const filename = `${this.translate.instant('motions')}-${this.translate.instant('example')}.csv`;
        this.csvExport.dummyCSVExport<MotionCsvExport>(getMotionExportHeadersAndVerboseNames() as any, rows, filename);
    }
}
