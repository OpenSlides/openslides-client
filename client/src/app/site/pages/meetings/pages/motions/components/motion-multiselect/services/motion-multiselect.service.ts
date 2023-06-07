import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Action } from 'src/app/gateways/actions';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { SpinnerService } from 'src/app/site/modules/global-spinner';
import { ListOfSpeakersControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import {
    AGENDA_LIST_ITEM_MINIMAL_SUBSCRIPTION,
    getAgendaListMinimalSubscriptionConfig
} from '../../../../agenda/agenda.subscription';
import { AgendaItemControllerService } from '../../../../agenda/services';
import {
    getParticipantMinimalSubscriptionConfig,
    PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL
} from '../../../../participants/participants.subscription';
import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { PersonalNoteControllerService } from '../../../modules/personal-notes/services';
import { MotionSubmitterControllerService } from '../../../modules/submitters/services';
import { TagControllerService } from '../../../modules/tags/services';
import { MotionWorkflowControllerService } from '../../../modules/workflows/services';
import { MotionControllerService } from '../../../services/common/motion-controller.service';
import { ViewMotion } from '../../../view-models';
import { MotionMultiselectServiceModule } from './motion-multiselect-service.module';

@Injectable({
    providedIn: MotionMultiselectServiceModule
})
export class MotionMultiselectService {
    private messageForSpinner = this.translate.instant(`Motions are in process. Please wait ...`);

    public constructor(
        private repo: MotionControllerService,
        private translate: TranslateService,
        private promptService: PromptService,
        private choiceService: ChoiceService,
        private userRepo: UserRepositoryService,
        private workflowRepo: MotionWorkflowControllerService,
        private categoryRepo: MotionCategoryControllerService,
        private submitterRepo: MotionSubmitterControllerService,
        private tagRepo: TagControllerService,
        private personalNoteRepo: PersonalNoteControllerService,
        private agendaRepo: AgendaItemControllerService,
        private motionBlockRepo: MotionBlockControllerService,
        private treeService: TreeService,
        private spinnerService: SpinnerService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        private snackbar: MatSnackBar,
        private modelRequestService: ModelRequestService
    ) {}

    /**
     * Deletes the given motions. Asks for confirmation.
     *
     * @param motions The motions to delete
     */
    public async delete(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected motions?`);
        if (await this.promptService.open(title)) {
            const message = `${motions.length} ${this.translate.instant(this.messageForSpinner)}`;
            this.spinnerService.show(message, { hideAfterPromiseResolved: () => this.repo.delete(...motions) });
        }
    }

    public async setWorkflow(motions: ViewMotion[]): Promise<void> {
        const title = _(`This will set the workflow for all selected motions:`);
        const choices = this.workflowRepo.getViewModelList();
        const selectedChoice = await this.choiceService.open({ title, choices });
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () =>
                    this.repo.update({ workflow_id: selectedChoice.firstId }, ...motions).resolve()
            });
        }
    }

    /**
     * Opens a dialog and then sets the status for all motions.
     *
     * @param motions The motions to change
     */
    public async setStateOfMultiple(motions: ViewMotion[]): Promise<void> {
        if (motions.some(motion => motion.state!.workflow_id !== motions[0].state!.workflow_id)) {
            const errorMsg = `You cannot change the state of motions in different workflows!`;
            this.snackbar.open(this.translate.instant(errorMsg), `Ok`);
            return;
        }
        const title = this.translate.instant(`This will set the following state for all selected motions:`);
        const choices = this.workflowRepo.getWorkflowStatesForMotions(motions);
        const selectedChoice = await this.choiceService.open({
            title,
            choices,
            sortFn: (a, b) => (a.weight && b.weight ? a.weight - b.weight : 0)
        });
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.setState(selectedChoice.firstId, ...motions).resolve()
            });
        }
    }

    /**
     * Opens a dialog and sets the recommendation to the users choice for all selected motions.
     *
     * @param motions The motions to change
     */
    public async setRecommendation(motions: ViewMotion[]): Promise<void> {
        if (motions.some(motion => motion.state!.workflow_id !== motions[0].state!.workflow_id)) {
            throw new Error(
                this.translate.instant(`You cannot change the recommendation of motions in different workflows!`)
            );
        }
        const title = this.translate.instant(`This will set the following recommendation for all selected motions:`);

        // hacks custom Displayables from recommendations
        // TODO: Recommendations should be an own class
        const choices: Selectable[] = this.workflowRepo
            .getWorkflowStatesForMotions(motions)
            .filter(workflowState => !!workflowState.recommendation_label)
            .map(workflowState => ({
                id: workflowState.id,
                getTitle: () => workflowState.recommendation_label,
                getListTitle: () => workflowState.recommendation_label
            }));
        const clearChoiceOption = this.translate.instant(`Clear recommendation`);
        const selectedChoice = await this.choiceService.open({ title, choices, multiSelect: false, clearChoiceOption });
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () =>
                    selectedChoice.action
                        ? this.repo.resetRecommendation(...motions).resolve()
                        : this.repo.setRecommendation(selectedChoice.firstId, ...motions).resolve()
            });
        }
    }

    /**
     * Opens a dialog and sets the category for all given motions.
     *
     * @param motions The motions to change
     */
    public async setCategory(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`This will set the following category for all selected motions:`);
        const clearChoiceOption = this.translate.instant(`No category`);
        const selectedChoice = await this.choiceService.open({
            title,
            choices: this.categoryRepo.getViewModelListObservable(),
            multiSelect: false,
            clearChoiceOption
        });
        const categoryId = selectedChoice?.action ? null : selectedChoice?.firstId;
        if (selectedChoice && categoryId) {
            const message = this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.setCategory(categoryId, ...motions)
            });
        }
    }

    /**
     * Opens a dialog and adds or removes the selected submitters for all given motions.
     *
     * @param motions The motions to add/remove the sumbitters to
     */
    public async changeSubmitters(motions: ViewMotion[]): Promise<void> {
        if (!motions.length) {
            return;
        }

        const subscriptionName = PARTICIPANT_LIST_SUBSCRIPTION_MINIMAL + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getParticipantMinimalSubscriptionConfig(motions[0].meeting_id),
            subscriptionName
        });

        const title = this.translate.instant(
            `This will add or remove the following submitters for all selected motions:`
        );
        const ADD = this.translate.instant(`Add`);
        const REMOVE = this.translate.instant(`Remove`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(
            title,
            this.userRepo.getViewModelListObservable(),
            true,
            choices
        );
        this.modelRequestService.closeSubscription(subscriptionName);
        if (selectedChoice) {
            let action: Action<any> | null = null;
            const users = (selectedChoice.ids as Ids).map(userId => ({ id: userId }));
            if (selectedChoice.action === ADD) {
                action = Action.from(...motions.map(motion => this.submitterRepo.create(motion, ...users)));
            } else if (selectedChoice.action === REMOVE) {
                action = Action.from(
                    this.submitterRepo.delete(
                        ...this.getSubmitterIds(
                            users.map(user => user.id),
                            motions
                        )
                    )
                );
            }

            if (action) {
                const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
                this.spinnerService.show(message, { hideAfterPromiseResolved: () => action!.resolve() });
            }
        }
    }

    /**
     * Opens a dialog and adds/removes the selected tags for all given motions.
     *
     * @param motions The motions to add the tags to
     */
    public async changeTags(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`This will add or remove the following tags for all selected motions:`);
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
            let requestData: Action<void>[] = [];
            if (selectedChoice.action === ADD) {
                requestData = motions.map(motion => {
                    const tagIds = new Set((motion.tag_ids || []).concat(selectedChoice.ids));
                    return this.repo.update({ tag_ids: Array.from(tagIds) }, motion);
                });
            } else if (selectedChoice.action === REMOVE) {
                requestData = motions.map(motion => {
                    const tagIdsToRemove = new Set(selectedChoice.ids as number[]);
                    return this.repo.update({ tag_ids: Array.from(tagIdsToRemove) }, motion);
                });
            } else {
                requestData = motions.map(motion => this.repo.update({ tag_ids: [] }, motion));
            }

            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => Action.from(...requestData).resolve()
            });
        }
    }

    /**
     * Opens a dialog and changes the motionBlock for all given motions.
     *
     * @param motions The motions for which to change the motionBlock
     */
    public async setMotionBlock(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`This will set the following motion block for all selected motions:`);
        const clearChoiceOption = this.translate.instant(`Clear motion block`);
        const selectedChoice = await this.choiceService.open({
            title,
            choices: this.motionBlockRepo.getViewModelListObservable(),
            multiSelect: false,
            clearChoiceOption
        });
        const blockId = selectedChoice?.action ? null : selectedChoice?.firstId;
        if (selectedChoice) {
            const message = this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.setBlock(blockId ?? null, ...motions)
            });
        }
    }

    /**
     * Moves the related agenda items from the motions as childs under a selected (parent) agenda item.
     */
    public async moveInAgenda(motions: ViewMotion[]): Promise<void> {
        if (!motions.length) {
            return;
        }

        const subscriptionName = AGENDA_LIST_ITEM_MINIMAL_SUBSCRIPTION + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getAgendaListMinimalSubscriptionConfig(motions[0].meeting_id),
            subscriptionName
        });

        const title = this.translate.instant(`This will move all selected motions as childs to:`);
        const choices = this.agendaRepo.getViewModelListObservable();
        const selectedChoice = await this.choiceService.open({ title, choices });
        this.modelRequestService.closeSubscription(subscriptionName);
        if (selectedChoice) {
            const actions: Action<any>[] = [];
            const motionsNotInAgenda = motions.filter(motion => !motion.agenda_item_id);
            if (motionsNotInAgenda.length) {
                const payload = { parent_id: selectedChoice.firstId, type: AgendaItemType.HIDDEN };
                actions.push(this.agendaRepo.addToAgenda(payload, ...motions));
            }
            if (motions.length > motionsNotInAgenda.length) {
                actions.push(
                    this.agendaRepo.assignToParent({
                        ids: motions.map(motion => motion.agenda_item_id).filter(id => !!id),
                        parent_id: selectedChoice.firstId
                    })
                );
            }

            if (actions.length) {
                const message = `${motions.length} ${this.translate.instant(this.messageForSpinner)}`;
                this.spinnerService.show(message, {
                    hideAfterPromiseResolved: () => Action.from(...actions).resolve()
                });
            }
        }
    }

    /**
     * Triggers the selected motions to be moved in the call-list (sort_parent, weight)
     * as children or as following after a selected motion.
     *
     * @param motions The motions to move
     */
    public async moveInCallList(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(
            `This will move all selected motions under or after the following motion in the call list:`
        );
        const TO_PARENT = this.translate.instant(`Set as parent`);
        const INSERT_AFTER = this.translate.instant(`Insert after`);
        const options = [TO_PARENT, INSERT_AFTER];
        const allMotions = this.repo.getViewModelList();
        const tree = this.treeService.makeSortedTree(allMotions, `sort_weight`, `sort_parent_id`);
        const itemsToMove = this.treeService.getBranchesFromTree(tree, motions);
        const partialTree = this.treeService.getTreeWithoutSelection(tree, motions);
        const availableMotions = this.treeService.getFlatItemsFromTree(partialTree);
        if (!availableMotions.length) {
            this.snackbar.open(`There are no motions left to choose`, `Ok`);
        } else {
            const selectedChoice = await this.choiceService.open(title, availableMotions, false, options);
            if (!selectedChoice) {
                return;
            }
            if (!selectedChoice.ids) {
                throw new Error(this.translate.instant(`No items selected`));
            }
            const parentId =
                selectedChoice.action === TO_PARENT
                    ? selectedChoice.firstId
                    : this.repo.getViewModel(selectedChoice.firstId)!.lead_motion_id;
            const olderSibling = selectedChoice.action === INSERT_AFTER ? selectedChoice.firstId : undefined;
            const sortedTree = this.treeService.insertBranchesIntoTree(
                partialTree,
                itemsToMove,
                parentId,
                olderSibling
            );
            const message = `${motions.length} ${this.translate.instant(this.messageForSpinner)}`;
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.sortMotions(this.treeService.stripTree(sortedTree))
            });
        }
    }

    /**
     * Bulk sets/unsets the favorite status (after a confirmation dialog)
     *
     * @param motions The motions to set/unset the favorite status for
     */
    public async bulkSetFavorite(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`This will set the favorite status for all selected motions:`);
        const options = [this.translate.instant(`Set as favorite`), this.translate.instant(`Set as not favorite`)];
        const selectedChoice = await this.choiceService.open({ title, multiSelect: false, actions: options });
        if (selectedChoice && motions.length) {
            // `bulkSetStar` does imply that "true" sets favorites while "false" unsets favorites
            const isFavorite = selectedChoice.action === options[0];
            const message = this.translate.instant(`I have ${motions.length} favorite motions. Please wait ...`);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.personalNoteRepo.setPersonalNote({ star: isFavorite }, ...motions)
            });
        }
    }

    public async bulkSetLosClosed(closed: boolean, motions: ViewMotion[]): Promise<void> {
        return await this.listOfSpeakersRepo.setClosed(closed, ...motions);
    }

    private getSubmitterIds(userIds: Id[], motions: ViewMotion[]): Identifiable[] {
        const submitterIds: Id[] = [];
        for (const motion of motions) {
            submitterIds.push(
                ...motion.submitters
                    .filter(submitter => userIds.includes(submitter.user_id))
                    .map(submitter => submitter.id)
            );
        }
        return submitterIds.map(id => ({ id }));
    }
}
