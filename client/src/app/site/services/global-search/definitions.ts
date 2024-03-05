import { Id } from 'src/app/domain/definitions/key-types';

export interface GlobalSearchEntry {
    title: string;
    text: string;
    fqid: string;
    collection: string;
    url?: string;
    obj?: any;
    meeting?: { id: Id; name: string; motions_show_sequential_number?: boolean };
    committee?: { id: Id; name: string };
    score?: number;
}

export interface GlobalSearchResponseEntry {
    content: any;
    score: number;
    matched_by: { [field: string]: string[] };
    matched_by_fqids: string[];
}

export interface GlobalSearchResponse {
    [fqid: string]: GlobalSearchResponseEntry;
}
