import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GroupRepositoryService } from '../../../../core/repositories/users/group-repository.service';

export interface ChatGroupDialogData {
    name: string;
    read_group_ids: number[];
    write_group_ids: number[];
}

@Component({
    selector: `os-chat-group-dialog`,
    templateUrl: `./chat-group-dialog.component.html`,
    styleUrls: [`./chat-group-dialog.component.scss`]
})
export class ChatGroupDialogComponent implements OnInit {
    public get isCreateView(): boolean {
        return !this.data;
    }

    public chatGroupFormGroup: FormGroup;

    public readonly previousChatGroupName: string;

    public constructor(
        public readonly groupsRepo: GroupRepositoryService,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private readonly data?: ChatGroupDialogData
    ) {
        if (data) {
            this.previousChatGroupName = data.name;
        }
    }

    ngOnInit(): void {
        const rawForm = {
            name: [``, Validators.required],
            read_group_ids: [[]],
            write_group_ids: [[]]
        };
        if (this.data) {
            Object.keys(rawForm).forEach(controlName => {
                if (this.data[controlName]) {
                    rawForm[controlName][0] = this.data[controlName];
                }
            });
        }
        this.chatGroupFormGroup = this.fb.group(rawForm);
    }
}
