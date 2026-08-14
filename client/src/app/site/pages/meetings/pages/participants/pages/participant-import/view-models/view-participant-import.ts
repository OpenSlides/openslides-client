import { Decimal } from '@app/domain/definitions/key-types';
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
    _(`Faulty participant`)
];
export const IMPORTED_PARTICIPANT_STATES_ITERABLE = [`new`, `done`, `referenced`, `error`];

export class ViewImportedParticipant implements Identifiable, BackendImportRow {
    // This class replaces BackendImportIdentifiedRow

    public meeting_id: number;
    public static COLLECTION = `importedParticipant`;

    public state: BackendImportState;
    public messages: string[];
    public data: Record<string, BackendImportEntry | BackendImportEntry[]>;

    public id: number;
    public first_name: string;
    public last_name: string;
    public email: string;
    public member_number: string;
    public number: string;
    public vote_weight: Decimal;
    public gender: string;
    public pronoun: string;
    public username: string;
    public default_password: string;
    public saml_id: string;
    public home_committee: string;
    public comment: string;
    public title: string;

    public structure_level: string[];
    public groups: string[];

    public external: boolean;
    public is_active: boolean;
    public is_present: boolean;
    public is_locked_out: boolean;
    public is_physical_person: boolean;

    public constructor(preview_id: number, preview: BackendImportRow, meeting_id: number) {
        this.meeting_id = meeting_id; // id of the meeting to import into
        this.id = preview_id;

        this.data = preview.data;
        this.messages = preview.messages ?? [];
        this.state = preview.state;

        for (const [key, entry] of Object.entries(preview.data)) {
            (this as Record<string, unknown>)[key] = Array.isArray(entry) ? entry.map(e => e['value']) : entry['value'];
        }
    }

    public get voteWeight(): Decimal {
        return this.vote_weight;
    }

    public get getGroups(): string[] {
        return [this.groups['value']];
    }

    public get getStructureLevels(): string[] {
        return this.structure_level;
    }

    public get changedVoteWeight(): boolean {
        return !this.vote_weight ? true : false;
    }

    public get hasMemberNumber(): boolean {
        return this.member_number ? true : false;
    }

    public get hasTitle(): boolean {
        return this.title?.length > 0 ? true : false;
    }

    public get hasSamlId(): boolean {
        return this.saml_id ? true : false;
    }

    public get hasEmail(): boolean {
        return this.email?.length > 0 ? true : false;
    }

    public get hasUsername(): boolean {
        return this.username ? true : false;
    }

    public get hasPronoun(): boolean {
        return this.pronoun ? true : false;
    }

    public get hasHomeCommittee(): boolean {
        return this.home_committee?.length > 0 ? true : false;
    }

    public get hasGroups(): boolean {
        return this.getGroups.length > 0 ? true : false;
    }

    public set setState(value: BackendImportState) {
        this.state = value;
    }
}
