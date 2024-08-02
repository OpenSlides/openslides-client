import { Directive, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Directive()
export abstract class BaseDialogService<ComponentType = any, DataType = any, ReturnType = any> {
    protected dialog = inject(MatDialog);

    public abstract open(data: DataType): Promise<MatDialogRef<ComponentType, ReturnType>>;
}
