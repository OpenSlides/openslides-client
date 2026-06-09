import { Identifiable } from 'src/app/domain/interfaces';
import {
    BackendImportEntry,
    BackendImportIdentifiedRow
} from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

export class ViewImportedParticipant implements Identifiable /* implements Searchable */ {
    public static COLLECTION = `importedParticipant`;

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

    public structure_level: string[];
    public groups: string[];

    public is_active;
    public is_present;
    public is_locked_out;
    public is_physical_person;

    public constructor(importedParticipant_id: BackendImportIdentifiedRow['id'], data?: BackendImportIdentifiedRow) {
        const importedParticipant = data['data'] ?? '';
        this.id = importedParticipant_id;

        this.title = getValue(importedParticipant?.['title']);
        this.first_name = getValue(importedParticipant?.['first_name']);
        this.last_name = getValue(importedParticipant?.['last_name']);
        this.email = getValue(importedParticipant?.['email']);
        this.member_number = getValue(importedParticipant?.['member_number']);
        this.structure_level = importedParticipant?.['structure_level'];
        this.groups = importedParticipant?.['groups']?.[0];
        this.number = getValue(importedParticipant?.['number']);
        this.vote_weight = getValue(importedParticipant?.['vote_weight']);
        this.gender = getValue(importedParticipant?.['gender']);
        this.pronoun = getValue(importedParticipant?.['pronoun']);
        this.username = getValue(importedParticipant?.['username']);
        this.default_password = getValue(importedParticipant?.['default_password']);

        this.is_active = getValue(importedParticipant?.['is_active']);
        this.is_physical_person = getValue(importedParticipant?.['is_physical_person']);
        this.is_present = getValue(importedParticipant?.['is_present']);
        this.is_locked_out = getValue(importedParticipant?.['locked_out']);

        this.saml_id = getValue(importedParticipant?.['saml_id']);
        this.home_committee = getValue(importedParticipant?.['home_committee']);
        this.external_comment = getValue(importedParticipant?.['external_comment']);
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
}

function getValue(field: BackendImportEntry | BackendImportEntry[]): string | number | boolean {
    if (!field) {
        console.log('No field:', field);
        return 0;
    }
    if (Array.isArray(field)) {
        return getValue(field[0]);
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
