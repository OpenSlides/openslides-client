import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
    GetUserRelatedModelsCommittee,
    GetUserRelatedModelsPresenterResult,
    GetUserRelatedModelsUser
} from '../../../core/core-services/member.service';
import { CML } from '../../../core/core-services/organization-permission';

@Component({
    selector: `os-member-delete-dialog`,
    templateUrl: `./member-delete-dialog.component.html`,
    styleUrls: [`./member-delete-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MemberDeleteDialogComponent implements OnInit {
    public get isOneMember(): boolean {
        return Object.keys(this.data).length === 1;
    }

    public set selectedMember(member: GetUserRelatedModelsUser) {
        if (this._selectedMember === member) {
            this._selectedMember = null;
        } else {
            this._selectedMember = member;
        }
    }

    public get selectedMember(): GetUserRelatedModelsUser | null {
        return this._selectedMember;
    }

    private _selectedMember: GetUserRelatedModelsUser | null = null;

    public constructor(@Inject(MAT_DIALOG_DATA) public data: GetUserRelatedModelsPresenterResult) {}

    public ngOnInit(): void {
        this.selectedMember = Object.values(this.data)[0];
    }

    public hasRelations(member: GetUserRelatedModelsUser): boolean {
        return member.meetings?.length > 0 || this.getManagedCommittees(member).length > 0;
    }

    public getManagedCommittees(member: GetUserRelatedModelsUser): GetUserRelatedModelsCommittee[] {
        return (member.committees || []).filter(committee => committee.cml === CML.can_manage);
    }
}
