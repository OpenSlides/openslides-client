import { Directive } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Directive()
export abstract class BaseDialogService<ComponentType = any, DataType = any, ReturnType = any> {
    public constructor(protected dialog: MatDialog) {}

    public abstract open(data: DataType): Promise<MatDialogRef<ComponentType, ReturnType>>;
}
