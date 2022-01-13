import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { AgendaItemAction } from 'app/core/actions/agenda-item-action';
import { MotionAction } from 'app/core/actions/motion-action';
import { MotionSubmitterAction } from 'app/core/actions/motion-submitter-action';
import { ActionRequest, ActionService } from 'app/core/core-services/action.service';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { Id } from 'app/core/definitions/key-types';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { RepositoryServiceCollector } from 'app/core/repositories/repository-service-collector';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { PersonalNoteRepositoryService } from 'app/core/repositories/users/personal-note-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ChoiceService } from 'app/core/ui-services/choice.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { SpinnerService } from 'app/core/ui-services/spinner.service';
import { TreeService } from 'app/core/ui-services/tree.service';
import { AgendaItemType } from 'app/shared/models/agenda/agenda-item';
import { Displayable } from 'app/site/base/displayable';

import { ViewMotion } from '../models/view-motion';

/**
 * Contains all multiselect actions for the motion list view.
 */
@Injectable({
    providedIn: `root`
})
export class MotionMultiselectService {
    private get activeMeetingId(): ActiveMeetingIdService {
        return this.serviceCollector.activeMeetingIdService;
    }

    private get actionService(): ActionService {
        return this.serviceCollector.actionService;
    }

    private messageForSpinner = this.translate.instant(`Motions are in process. Please wait ...`);

    /**
     * Does nothing.
     *
     * @param repo MotionRepositoryService
     * @param translate TranslateService
     * @param promptService
     * @param choiceService
     * @param userRepo
     * @param workflowRepo
     * @param categoryRepo
     * @param tagRepo
     * @param agendaRepo
     * @param motionBlockRepo
     * @param httpService
     * @param treeService
     * @param spinnerService to show a spinner when http-requests are made.
     */
    public constructor(
        private repo: MotionRepositoryService,
        private translate: TranslateService,
        private promptService: PromptService,
        private choiceService: ChoiceService,
        private userRepo: UserRepositoryService,
        private workflowRepo: MotionWorkflowRepositoryService,
        private categoryRepo: MotionCategoryRepositoryService,
        private tagRepo: TagRepositoryService,
        private personalNoteRepo: PersonalNoteRepositoryService,
        private agendaRepo: AgendaItemRepositoryService,
        private motionBlockRepo: MotionBlockRepositoryService,
        private treeService: TreeService,
        private spinnerService: SpinnerService,
        private serviceCollector: RepositoryServiceCollector,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService
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
        const selectedChoice = await this.choiceService.open(title, choices);
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () =>
                    this.repo.update({ workflow_id: selectedChoice.items as number }, ...motions)
            });
        }
    }

    /**
     * Opens a dialog and then sets the status for all motions.
     *
     * @param motions The motions to change
     */
    public async setStateOfMultiple(motions: ViewMotion[]): Promise<void> {
        if (motions.some(motion => motion.state.workflow_id !== motions[0].state.workflow_id)) {
            throw new Error(this.translate.instant(`You cannot change the state of motions in different workflows!`));
        }
        const title = this.translate.instant(`This will set the following state for all selected motions:`);
        const choices = this.workflowRepo.getWorkflowStatesForMotions(motions);
        const selectedChoice = await this.choiceService.open(title, choices);
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.setState(selectedChoice.items as number, ...motions)
            });
        }
    }

    /**
     * Opens a dialog and sets the recommendation to the users choice for all selected motions.
     *
     * @param motions The motions to change
     */
    public async setRecommendation(motions: ViewMotion[]): Promise<void> {
        if (motions.some(motion => motion.state.workflow_id !== motions[0].state.workflow_id)) {
            throw new Error(
                this.translate.instant(`You cannot change the recommendation of motions in different workflows!`)
            );
        }
        const title = this.translate.instant(`This will set the following recommendation for all selected motions:`);

        // hacks custom Displayables from recommendations
        // TODO: Recommendations should be an own class
        const choices: Displayable[] = this.workflowRepo
            .getWorkflowStatesForMotions(motions)
            .filter(workflowState => !!workflowState.recommendation_label)
            .map(workflowState => ({
                id: workflowState.id,
                getTitle: () => workflowState.recommendation_label,
                getListTitle: () => workflowState.recommendation_label
            }));
        const clearChoice = this.translate.instant(`Delete recommendation`);
        const selectedChoice = await this.choiceService.open(title, choices, false, null, clearChoice);
        if (selectedChoice) {
            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () =>
                    selectedChoice.action
                        ? this.repo.resetRecommendation(...motions)
                        : this.repo.setRecommendation(selectedChoice.items as number, ...motions)
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
        const clearChoice = this.translate.instant(`No category`);
        const selectedChoice = await this.choiceService.open(
            title,
            this.categoryRepo.getViewModelListObservable(),
            false,
            null,
            clearChoice
        );
        if (selectedChoice) {
            const message = this.translate.instant(this.messageForSpinner);
            const categoryId = selectedChoice.action ? null : (selectedChoice.items as number);
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
        if (selectedChoice) {
            let promiseFn: () => Promise<any> = null;
            if (selectedChoice.action === ADD) {
                const payload: MotionSubmitterAction.CreatePayload[] = (selectedChoice.items as number[]).flatMap(
                    userId => motions.map(motion => ({ user_id: userId, motion_id: motion.id }))
                );
                promiseFn = () => this.sendBulkActionToBackend(MotionSubmitterAction.CREATE, payload);
            } else if (selectedChoice.action === REMOVE) {
                const payload: MotionSubmitterAction.DeletePayload[] = this.getSubmitterIds(
                    selectedChoice.items as number[],
                    motions
                ).map(submitterId => ({ id: submitterId }));
                promiseFn = () => this.sendBulkActionToBackend(MotionSubmitterAction.DELETE, payload);
            }

            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, { hideAfterPromiseResolved: promiseFn });
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
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(
            title,
            this.tagRepo.getViewModelListObservable(),
            true,
            choices,
            this.translate.instant(`Clear tags`)
        );
        if (selectedChoice) {
            let requestData: MotionAction.UpdatePayload[] = null;
            if (selectedChoice.action === ADD) {
                requestData = motions.map(motion => {
                    const tagIds = new Set((motion.tag_ids || []).concat(selectedChoice.items));
                    return {
                        id: motion.id,
                        tag_ids: Array.from(tagIds)
                    };
                });
            } else if (selectedChoice.action === REMOVE) {
                requestData = motions.map(motion => {
                    const tagIdsToRemove = new Set(selectedChoice.items as number[]);
                    return {
                        id: motion.id,
                        tag_ids: (motion.tag_ids || []).filter(id => !tagIdsToRemove.has(id))
                    };
                });
            } else {
                requestData = motions.map(motion => ({
                    id: motion.id,
                    tag_ids: []
                }));
            }

            const message = `${motions.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.sendBulkActionToBackend(MotionAction.UPDATE, requestData)
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
        const clearChoice = this.translate.instant(`Clear motion block`);
        const selectedChoice = await this.choiceService.open(
            title,
            this.motionBlockRepo.getViewModelListObservable(),
            false,
            null,
            clearChoice
        );
        if (selectedChoice) {
            const message = this.translate.instant(this.messageForSpinner);
            const blockId = selectedChoice.action ? null : (selectedChoice.items as number);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.repo.setBlock(blockId, ...motions)
            });
        }
    }

    /**
     * Moves the related agenda items from the motions as childs under a selected (parent) agenda item.
     */
    public async moveInAgenda(motions: ViewMotion[]): Promise<void> {
        const title = this.translate.instant(`This will move all selected motions as childs to:`);
        const choices = this.agendaRepo.getViewModelListObservable();
        const selectedChoice = await this.choiceService.open(title, choices);
        if (selectedChoice) {
            const requests: ActionRequest[] = [];
            const motionsNotInAgenda = motions.filter(motion => !motion.agenda_item_id);
            if (motionsNotInAgenda.length) {
                const createAgendaItemPayload: AgendaItemAction.CreatePayload[] = motionsNotInAgenda.map(motion => ({
                    content_object_id: motion.fqid,
                    parent_id: selectedChoice.items as number,
                    type: AgendaItemType.HIDDEN
                }));
                requests.push({
                    action: AgendaItemAction.CREATE,
                    data: createAgendaItemPayload
                });
            }
            if (motions.length > motionsNotInAgenda.length) {
                const requestData: AgendaItemAction.AssignPayload = {
                    ids: motions.map(motion => motion.agenda_item_id).filter(id => !!id),
                    parent_id: selectedChoice.items as number,
                    meeting_id: this.activeMeetingId.meetingId
                };
                requests.push({
                    action: AgendaItemAction.ASSIGN,
                    data: [requestData]
                });
            }

            const message = `${motions.length} ${this.translate.instant(this.messageForSpinner)}`;
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: () => this.actionService.sendRequests(requests)
            });
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
            throw new Error(this.translate.instant(`There are no items left to chose from`));
        } else {
            const selectedChoice = await this.choiceService.open(title, availableMotions, false, options);
            if (!selectedChoice) {
                return;
            }
            if (!selectedChoice.items) {
                throw new Error(this.translate.instant(`No items selected`));
            }
            const parentId =
                selectedChoice.action === TO_PARENT
                    ? (selectedChoice.items as number)
                    : this.repo.getViewModel(selectedChoice.items as number).lead_motion_id;
            const olderSibling = selectedChoice.action === INSERT_AFTER ? (selectedChoice.items as number) : undefined;
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
        const selectedChoice = await this.choiceService.open(title, null, false, options);
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

    private getSubmitterIds(userIds: Id[], motions: ViewMotion[]): Id[] {
        const submitterIds: Id[] = [];
        for (const motion of motions) {
            submitterIds.push(
                ...motion.submitters
                    .filter(submitter => userIds.includes(submitter.user_id))
                    .map(submitter => submitter.id)
            );
        }
        return submitterIds;
    }

    private sendBulkActionToBackend(action: string, payload: any[]): Promise<any> {
        return this.actionService.sendBulkRequest(action, payload);
    }
}
