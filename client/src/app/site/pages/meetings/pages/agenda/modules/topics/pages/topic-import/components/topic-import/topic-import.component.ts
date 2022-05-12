import { Component, OnInit } from '@angular/core';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { AgendaItemType, ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { DurationService } from 'src/app/site/services/duration.service';
import { topicHeadersAndVerboseNames } from '../../../../definitions';
import { TopicImportService } from '../../services/topic-import.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

const TEXT_IMPORT_TAB_INDEX = 0;

@Component({
    selector: 'os-topic-import',
    templateUrl: './topic-import.component.html',
    styleUrls: ['./topic-import.component.scss']
})
export class TopicImportComponent extends BaseImportListComponent<Topic> {
    /**
     * A form for text input
     */
    public textAreaForm: FormGroup;

    public possibleFields = Object.values(topicHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(topicHeadersAndVerboseNames).map(header => ({
        prop: `newEntry.${header}`,
        label: _((<any>topicHeadersAndVerboseNames)[header]),
        isTableColumn: true,
        isRequired: header === `title`
    }));

    public get isTextImportSelected(): boolean {
        return this.selectedTabIndex === TEXT_IMPORT_TAB_INDEX;
    }

    public selectedTabIndex = 0;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        public override importer: TopicImportService,
        formBuilder: FormBuilder,
        private durationService: DurationService
    ) {
        super(componentServiceCollector, translate, importer);
        this.textAreaForm = formBuilder.group({ inputtext: [``] });
    }

    /**
     * Fetches the string to a item_type
     *
     * @param type
     * @returns A string, which may be empty if the type is not found in the visibilityChoices
     */
    public getTypeString(type: AgendaItemType): string {
        const visibility = ItemTypeChoices.find(choice => choice.key === type);
        return visibility ? visibility.name : ``;
    }

    /**
     * Sends the data in the text field input area to the importer
     */
    public parseTextArea(): void {
        (this.importer as TopicImportService).parseTextArea(this.textAreaForm.get(`inputtext`)!.value);
    }

    /**
     * Triggers a change in the tab group: Clearing the preview selection
     */
    public onTabChange(): void {
        this.importer.clearPreview();
    }

    /**
     * Gets a readable string for a duration
     *
     * @param duration
     * @returns a duration string, an empty string if the duration is not set or negative
     */
    public getDuration(duration: number): string {
        if (duration >= 0) {
            return this.durationService.durationToString(duration, `h`);
        } else {
            return ``;
        }
    }
}
