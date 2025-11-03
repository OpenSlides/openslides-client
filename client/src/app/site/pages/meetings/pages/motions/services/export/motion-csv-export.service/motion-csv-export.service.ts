import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeRecoMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { CsvColumnDefinitionMap, CsvColumnDefinitionProperty } from 'src/app/gateways/export/csv-export.service';
import { reconvertChars, stripHtmlTags } from 'src/app/infrastructure/utils';
import { MeetingCsvExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { LineNumberingService } from '../../../modules/change-recommendations/services';
import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { ViewMotion } from '../../../view-models';
import { MotionControllerService } from '../../common/motion-controller.service';
import { MotionFormatService } from '../../common/motion-format.service';
import { getMotionExportHeadersAndVerboseNames, sortMotionPropertyList } from '../definitions';

interface MotionCsvExport {
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

const MotionCsvExportExample: MotionCsvExport[] = [
    {
        number: `A1`,
        title: `Title 1`,
        text: `Text 1`,
        motion_block: `Block A`,
        category: `Category A`,
        submitters: `Submitter a`,
        reason: `Because it is so`
    },
    {
        number: `B2`,
        title: `Title 2`,
        text: `Text 2`,
        motion_block: `Block B`,
        category: `A - Category`,
        submitters: `Submitter A`,
        reason: `Penguins can fly`
    },
    {
        number: `C2`,
        title: `Title 3`,
        text: `Text 3`
    }
];

@Injectable({
    providedIn: `root`
})
export class MotionCsvExportService {
    public crMode = ChangeRecoMode;

    public constructor(
        private csvExport: MeetingCsvExportService,
        private translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private lineNumberingService: LineNumberingService,
        private motionService: MotionControllerService,
        private motionFormatService: MotionFormatService,
        private commentRepo: MotionCommentSectionControllerService
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
        const lineLength = this.meetingSettingsService.instant(`motions_line_length`) as number;
        const changes = this.motionFormatService.getUnifiedChanges(motion, lineLength);
        const text = this.motionFormatService.formatMotion({ targetMotion: motion, crMode, changes, lineLength });
        const strippedLines = this.lineNumberingService.stripLineNumbers(text);
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
            crMode = this.crMode.Original;
        }
        const properties = sortMotionPropertyList([`number`, `title`].concat(contentToExport));
        if (contentToExport.includes(`speakers`)) {
            properties.push(`speakers`);
        }
        const exportProperties: (CsvColumnDefinitionProperty<ViewMotion> | CsvColumnDefinitionMap<ViewMotion>)[] =
            properties.map(option => {
                switch (option) {
                    case `submitters`:
                        return {
                            label: `submitters`,
                            map: motion => motion.mapSubmittersWithAdditional(s => s.full_name).join(`, `)
                        };
                    case `editors`:
                        return {
                            label: `Motion editors`,
                            map: motion => motion.editors.join(`, `)
                        };
                    case `working_group_speakers`:
                        return {
                            label: `Spokesperson`,
                            map: motion => motion.working_group_speakers.join(`, `)
                        };
                    case `recommendation`:
                        return {
                            label: `recommendation`,
                            map: motion => this.motionService.getExtendedRecommendationLabel(motion)
                        };
                    case `state`:
                        return {
                            label: `state`,
                            map: motion => this.motionService.getExtendedStateLabel(motion)
                        };
                    case `text`:
                        return {
                            label: `Text`,
                            map: motion => this.createText(motion, crMode!)
                        };
                    case `block`:
                        return {
                            label: `Motion block`,
                            map: motion => (motion.block ? motion.block.getTitle() : ``)
                        };
                    case `speakers`:
                        return {
                            label: `Number of open requests to speak`,
                            map: motion =>
                                motion.list_of_speakers && motion.list_of_speakers.waitingSpeakerAmount > 0
                                    ? motion.list_of_speakers.waitingSpeakerAmount.toString()
                                    : ``
                        };
                    default:
                        return { property: option } as CsvColumnDefinitionProperty<ViewMotion>;
                }
            });
        // referring motions
        if (contentToExport?.includes(`referring_motions`)) {
            exportProperties.push({
                label: `Referring motions`,
                map: motion =>
                    motion.referenced_in_motion_recommendation_extensions
                        .naturalSort(this.translate.getCurrentLang(), [`number`, `title`])
                        .map(motion => motion.getNumberOrTitle())
                        .join(`, `)
            });
        }
        exportProperties.push(
            ...comments.map(commentId => {
                const label =
                    commentId === PERSONAL_NOTE_ID
                        ? this.translate.instant(`Personal note`)
                        : this.commentRepo.getViewModel(commentId)!.getTitle();
                return {
                    label,
                    map: (motion: ViewMotion): string => {
                        if (commentId === PERSONAL_NOTE_ID) {
                            return motion && motion.getPersonalNote()! && motion.getPersonalNote()!.note;
                        } else {
                            const viewComment = this.commentRepo.getViewModel(commentId)!;
                            const motionComment = motion.getCommentForSection(viewComment);
                            return motionComment && motionComment.comment
                                ? reconvertChars(stripHtmlTags(motionComment.comment))
                                : ``;
                        }
                    }
                };
            })
        );

        this.csvExport.export(motions, exportProperties, this.translate.instant(`Motions`) + `.csv`);
    }

    /** numberOrTitle
     * Exports the call list.
     *
     * @param motions All motions in the CSV. They should be ordered by weight correctly.
     */
    public exportCallList(motions: ViewMotion[]): void {
        motions.sort((a, b) => a.tree_weight - b.tree_weight);
        this.csvExport.export(
            motions,
            [
                { label: `Called`, map: (motion): string => (motion.sort_parent_id ? `` : motion.numberOrTitle) },
                { label: `Called with`, map: (motion): string => (!motion.sort_parent_id ? `` : motion.numberOrTitle) },
                {
                    label: `submitters`,
                    map: (motion): string => motion.mapSubmittersWithAdditional(s => s.short_name).join(`,`)
                },
                { property: `title` },
                {
                    label: `recommendation`,
                    map: (motion): string =>
                        motion.recommendation ? this.motionService.getExtendedRecommendationLabel(motion) : ``
                },
                { property: `block`, label: `Motion block` }
            ],
            this.translate.instant(`Call list`) + `.csv`
        );
    }

    public exportDummyMotion(): void {
        const rows: MotionCsvExport[] = MotionCsvExportExample;
        const filename = `${this.translate.instant(`motions`)}-${this.translate.instant(`example`)}.csv`;
        this.csvExport.dummyCSVExport<MotionCsvExport>(getMotionExportHeadersAndVerboseNames() as any, rows, filename);
    }
}
