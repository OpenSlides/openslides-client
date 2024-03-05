import { Observable } from 'rxjs';

export type ImportListHeaderDefinition = HeaderDefinition;

interface HeaderDefinition {
    label: string;
    property: string;
    type?: `boolean` | `string` | `number` | `date`;
    isRequired?: boolean;
    isTableColumn?: boolean;
    width?: number;
    flexible?: boolean;
    customInfo?: string | Observable<string>;
}
