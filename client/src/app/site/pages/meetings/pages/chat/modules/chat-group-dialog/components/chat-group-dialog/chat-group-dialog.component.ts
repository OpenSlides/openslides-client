import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { ViewGroup } from '../../../../../participants';
import { GroupControllerService } from '../../../../../participants/modules/groups/services/group-controller.service';
import { ChatGroupDialogData } from '../../services/chat-group-dialog.service';

@Component({
    selector: `os-chat-group-dialog`,
    templateUrl: `./chat-group-dialog.component.html`,
    styleUrls: [`./chat-group-dialog.component.scss`]
})
export class ChatGroupDialogComponent implements OnInit {
    public get isCreateView(): boolean {
        return !this.data;
    }

    public chatGroupFormGroup!: UntypedFormGroup;

    public readonly previousChatGroupName!: string;

    public readonly groupsObservable = this.groupsRepo.getViewModelListObservable();

    public sortFn = (groupA: ViewGroup, groupB: ViewGroup) => groupA.weight - groupB.weight;

    public constructor(
        private groupsRepo: GroupControllerService,
        private fb: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private readonly data?: ChatGroupDialogData
    ) {
        if (data) {
            this.previousChatGroupName = data.name;
        }
    }

    public ngOnInit(): void {
        const rawForm: any = {
            name: [``, Validators.required],
            read_group_ids: [[]],
            write_group_ids: [[]]
        };
        if (this.data) {
            Object.keys(rawForm).forEach(controlName => {
                if (this.data?.[controlName as keyof ChatGroupDialogData]) {
                    rawForm[controlName][0] = this.data[controlName as keyof ChatGroupDialogData];
                }
            });
        }
        this.chatGroupFormGroup = this.fb.group(rawForm);
    }
}
