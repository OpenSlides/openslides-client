import { Identifiable } from '@app/domain/interfaces';
import {
    BackendImportEntry,
    BackendImportRow,
    BackendImportState
} from '@app/ui/modules/import-list/definitions/backend-import-preview';
import { _ } from '@ngx-translate/core';

export const IMPORTED_PARTICIPANT_STATES = [
    _(`New participant`),
    _(`Updated participant`),
    _('Referenced participant'),
    _(`Unchanged participant`),
    _(`Faulty participant`)
];
export const IMPORTED_PARTICIPANT_STATES_ITERABLE = [`new`, `done`, `referenced`, `unchanged`, `error`];

export class BackendImportRowClass implements Identifiable, BackendImportRow {
    // This class wraps BackendImportIdentifiedRow

    public static readonly COLLECTION = `importedParticipant`;

    public state: BackendImportState;
    public messages: string[];
    public data: Record<string, BackendImportEntry | BackendImportEntry[]>;

    public id: number;

    public constructor(preview_id: number, preview: BackendImportRow) {
        this.id = preview_id;
        this.data = preview.data;
        this.messages = preview.messages ?? [];
        this.state = preview.state;
    }

    public get changedVoteWeight(): boolean {
        return !this.data?.['vote_weight'];
    }

    public get hasMemberNumber(): boolean {
        return !!this.data?.['member_number'];
    }

    public get hasTitle(): boolean {
        return !!this.data?.['title'];
    }

    public get hasSamlId(): boolean {
        return !!this.data?.['saml_id'];
    }

    public get hasEmail(): boolean {
        return !!this.data?.['email'];
    }

    public get hasUsername(): boolean {
        return !!this.data?.['username'];
    }

    public get hasPronoun(): boolean {
        return !!this.data?.['pronoun'];
    }

    public get gender(): any {
        return this.data?.['gender']?.['value'];
    }

    public get hasHomeCommittee(): boolean {
        return !!this.data?.['home_committee'];
    }

    public get hasGroups(): boolean {
        return !!((this.data['groups'] as BackendImportEntry[]).length > 0);
    }

    public get isLockedOut(): boolean {
        return !!this.data?.['is_locked_out'];
    }

    public get isPresent(): boolean {
        return !!this.data?.['is_present'];
    }

    public get isActive(): boolean {
        return !!this.data?.['is_active'];
    }

    public get isPhysicalPerson(): boolean {
        return !!this.data?.['is_physical_person'];
    }

    public get isExternal(): boolean {
        return !!this.data?.['external'];
    }

    public set setState(value: BackendImportState) {
        this.state = value;
    }
}
