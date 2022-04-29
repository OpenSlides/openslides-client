import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupControllerService } from '../../../../../participants/modules/groups/services/group-controller.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatGroupDialogData } from '../../services/chat-group-dialog.service';

@Component({
    selector: 'os-chat-group-dialog',
    templateUrl: './chat-group-dialog.component.html',
    styleUrls: ['./chat-group-dialog.component.scss']
})
export class ChatGroupDialogComponent implements OnInit {
    public get isCreateView(): boolean {
        return !this.data;
    }

    public chatGroupFormGroup!: FormGroup;

    public readonly previousChatGroupName!: string;

    public constructor(
        public readonly groupsRepo: GroupControllerService,
        private fb: FormBuilder,
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
