import { Directive } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Directive()
export abstract class BaseDialogService<ComponentType = any, DataType = any, ReturnType = any> {
    public constructor(protected dialog: MatDialog) {}

    public abstract open(data: DataType): Promise<MatDialogRef<ComponentType, ReturnType>>;
}
