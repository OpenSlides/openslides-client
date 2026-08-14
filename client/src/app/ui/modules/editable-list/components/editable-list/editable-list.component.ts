import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * An editable list of strings.
 * Items are passed in via `[(items)]` two-way binding or separate `[items]` / `(itemsChange)`.
 *
 * Example:
 * ```html
 * <os-editable-list [(items)]="myItems" placeholder="Add option" />
 * ```
 */
@Component({
    selector: 'os-editable-list',
    imports: [
        DragDropModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        TranslatePipe
    ],
    templateUrl: './editable-list.component.html',
    styleUrl: './editable-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableListComponent {
    public items = model<string[]>([]);
    public placeholder = input<string>('Add item');

    public readonly inputValue = signal<string>('');

    public addItem(): void {
        const val = this.inputValue().trim();
        if (!val) {
            return;
        }
        this.items.update(current => [...current, val]);
        this.inputValue.set('');
    }

    public removeItem(index: number): void {
        this.items.update(current => current.filter((_, i) => i !== index));
    }

    public drop(event: CdkDragDrop<string[]>): void {
        this.items.update(current => {
            const copy = [...current];
            moveItemInArray(copy, event.previousIndex, event.currentIndex);
            return copy;
        });
    }
}
