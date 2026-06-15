import { _ } from '@ngx-translate/core';
import { Identifiable } from 'src/app/domain/interfaces';
import {
    BackendImportEntry,
    BackendImportRow,
    BackendImportState
} from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

export const STATES = [
    _(`New participant`),
    _(`Updated participant`),
    _('Referenced participant'),
    _(`Faulty participant`)
];
export const STATE_FITERABLE = [`new`, `done`, `generated`, `error`];

export class ViewImportedParticipant implements Identifiable, BackendImportRow /* implements Searchable */ {
    // This class replaces BackendImportIdentifiedRow

    public static COLLECTION = `importedParticipant`;

    public state: BackendImportState;
    public messages: string[];
    public data: Record<string, BackendImportEntry | BackendImportEntry[]>;

    public id: number;
    public first_name;
    public last_name;
    public email;
    public member_number;
    public number;
    public vote_weight;
    public gender;
    public pronoun;
    public username;
    public default_password;
    public saml_id;
    public home_committee;
    public external_comment;
    public title;

    public structure_level;
    public groups: string[];

    public is_active;
    public is_present;
    public is_locked_out;
    public is_physical_person;

    public constructor(preview_id, preview: BackendImportRow) {
        this.id = preview_id;

        this.data = preview.data;
        this.messages = preview.messages;
        this.state = preview.state;

        this.title = this.setValue(this.data?.['title']);
        this.first_name = this.setValue(this.data?.['first_name']);
        this.last_name = this.setValue(this.data?.['last_name']);
        this.email = this.setValue(this.data?.['email']);
        this.member_number = this.setValue(this.data?.['member_number']);
        this.structure_level = this.data?.['structure_level'];
        this.groups = this.data?.['groups']?.[0];
        this.number = this.setValue(this.data?.['number']);
        this.vote_weight = this.setValue(this.data?.['vote_weight']);
        this.gender = this.setValue(this.data?.['gender']);
        this.pronoun = this.setValue(this.data?.['pronoun']);
        this.username = this.setValue(this.data?.['username']);
        this.default_password = this.setValue(this.data?.['default_password']);

        this.is_active = this.getBooleanValue(this.setValue(this.data?.['is_active']));
        this.is_physical_person = this.getBooleanValue(this.setValue(this.data?.['is_physical_person']));
        this.is_present = this.getBooleanValue(this.setValue(this.data?.['is_present']));
        this.is_locked_out = this.getBooleanValue(this.setValue(this.data?.['locked_out']));

        this.saml_id = this.setValue(this.data?.['saml_id']);
        this.home_committee = this.setValue(this.data?.['home_committee']);
        this.external_comment = this.setValue(this.data?.['external_comment']);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof ViewImportedParticipant)[] = [
        'id',
        'first_name',
        'last_name',
        'email',
        'member_number',
        'vote_weight',
        'gender',
        'pronoun',
        'username',
        'default_password',
        'saml_id',
        'home_committee',
        'external_comment',
        'title',
        'structure_level',
        'groups',
        'is_active',
        'is_present',
        'is_locked_out',
        'is_physical_person'
    ];

    public setValue(field: BackendImportEntry | BackendImportEntry[]): string | number | boolean | undefined {
        if (!field) {
            return undefined;
        }
        if (Array.isArray(field)) {
            return this.setValue(field[0]);
        }
        if (typeof field === 'string') {
            return field;
        }
        if (typeof field === 'number') {
            return field;
        }
        if (typeof field === 'boolean') {
            return field;
        }
        return field.value;
    }

    public getBooleanValue(value: string | number | boolean | undefined): boolean {
        return !!value;
    }

    public get changedVoteWeight(): boolean {
        return this.vote_weight < 1 || this.vote_weight > 1 || !this.vote_weight ? true : false;
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
        return this.groups?.length > 0 ? true : false;
    }
}
