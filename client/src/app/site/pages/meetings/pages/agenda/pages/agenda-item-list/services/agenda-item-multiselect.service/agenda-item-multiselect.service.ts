import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'src/app/site/modules/global-spinner';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { ChoiceAnswer } from 'src/app/ui/modules/choice-dialog/definitions';

import { ViewTag } from '../../../../../motions';
import { TagControllerService } from '../../../../../motions/modules/tags/services';
import { AgendaItemControllerService } from '../../../../services';
import { ViewAgendaItem } from '../../../../view-models';
import { AgendaItemListServiceModule } from '../agenda-item-list-service.module';

@Injectable({
    providedIn: AgendaItemListServiceModule
})
export class AgendaItemMultiselectService {
    private messageForSpinner = this.translate.instant(`Agenda items are in process. Please wait ...`);

    public constructor(
        private choiceService: ChoiceService,
        private spinnerService: SpinnerService,
        public repo: AgendaItemControllerService,
        private tagRepo: TagControllerService,
        private translate: TranslateService
    ) {}

    /**
     * Opens a dialog and adds/removes the selected tags for all given agenda items.
     *
     * @param agendaItems The agenda items to add the tags to
     */
    public async changeTags(agendaItems: ViewAgendaItem[]): Promise<void> {
        const title = this.translate.instant(
            `This will add or remove the following tags for all selected agenda items:`
        );
        const ADD = this.translate.instant(`Add`);
        const REMOVE = this.translate.instant(`Remove`);
        const actions = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open({
            title,
            choices: this.tagRepo.getViewModelListObservable(),
            multiSelect: true,
            actions,
            clearChoiceOption: this.translate.instant(`Clear tags`)
        });

        if (selectedChoice) {
            const requestData: Promise<void>[] = [];
            if (selectedChoice.action === ADD) {
                this.addTags(agendaItems, selectedChoice);
            } else if (selectedChoice.action === REMOVE) {
                this.removeTags(agendaItems, selectedChoice);
            } else {
                this.clearTags(agendaItems);
            }

            const message = `${agendaItems.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: async () => {
                    for (const request of requestData) {
                        await request;
                    }
                }
            });
        }
    }

    private async addTags(agendaItems: ViewAgendaItem[], selectedChoice: ChoiceAnswer<ViewTag>) {
        return agendaItems.map(agendaItem => {
            const tagIds = new Set((agendaItem.tag_ids || []).concat(selectedChoice.ids));
            return this.repo.update({ tag_ids: Array.from(tagIds) }, agendaItem);
        });
    }

    private async removeTags(agendaItems: ViewAgendaItem[], selectedChoice: ChoiceAnswer<ViewTag>) {
        return agendaItems.map(agendaItem => {
            const remainingTagIds = new Set(
                agendaItem.tag_ids.filter(tagId => selectedChoice.ids.indexOf(tagId) === -1)
            );
            return this.repo.update({ tag_ids: Array.from(remainingTagIds) }, agendaItem);
        });
    }

    private async clearTags(agendaItems: ViewAgendaItem[]) {
        return agendaItems.map(agendaItem => this.repo.update({ tag_ids: [] }, agendaItem));
    }
}
