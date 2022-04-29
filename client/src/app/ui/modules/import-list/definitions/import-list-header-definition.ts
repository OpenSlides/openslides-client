import { PblColumnDefinition } from '@pebula/ngrid';
export type ImportListHeaderDefinition = PblColumnDefinition & HeaderDefinition;

interface HeaderDefinition {
    label: string;
    prop: string;
    isRequired?: boolean;
    isTableColumn?: boolean;
}
