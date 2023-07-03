import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

interface AllocationBox {
    entry: string;
    allocation: string;
}

export interface AllocationListConfig {
    entryLabel: string;
    allocationLabel: string;
    addButtonLabel: string;
    isNumberAllocation?: boolean; //default: false
}

/**
 * A list that allows one to create string entries and assign them a string or number value
 *
 * @example:
 * ```html
 * <os-allocation-list formControlName="value"></os-allocation-list>
 * ```
 */
@Component({
    selector: `os-allocation-list`,
    templateUrl: `./allocation-list.component.html`,
    styleUrls: [`./allocation-list.component.scss`],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AllocationListComponent),
            multi: true
        }
    ]
})
export class AllocationListComponent implements ControlValueAccessor, OnInit {
    @Input()
    public set config(config: AllocationListConfig) {
        this.configSubject.next(config);
    }

    public get config(): AllocationListConfig {
        return this.configSubject.value;
    }

    public get allocationLabel(): string {
        return this.config?.allocationLabel;
    }

    public get entryLabel(): string {
        return this.config?.entryLabel;
    }

    public get addButtonLabel(): string {
        return this.config?.addButtonLabel;
    }

    public get isNumberAllocation(): boolean {
        return this.config?.isNumberAllocation;
    }

    /**
     * The parent form-group.
     */
    public allocationListForm!: UntypedFormGroup;

    /**
     * Reference to the form-control within the `allocationListForm`.
     */
    public allocationBoxes!: UntypedFormArray;

    private configSubject = new BehaviorSubject<AllocationListConfig>(null);

    /**
     * Default constructor.
     *
     * @param formBuilder FormBuilder
     */
    public constructor(private formBuilder: UntypedFormBuilder) {}

    /**
     * Initializes the form-controls.
     */
    public ngOnInit(): void {
        this.allocationListForm = this.formBuilder.group({
            allocationBoxes: this.formBuilder.array([])
        });

        this.allocationBoxes = this.allocationListForm.get(`allocationBoxes`) as UntypedFormArray;
        this.allocationBoxes.valueChanges.subscribe((value: AllocationBox[]) => {
            if (this.allocationBoxes.valid) {
                this.propagateChange(
                    value.mapToObject(entry => ({
                        [entry.entry]: this.isNumberAllocation ? Number(entry.allocation) : entry.allocation
                    }))
                );
            }
        });
    }

    /**
     * Helper function to determine which information to give to the parent form
     */
    private propagateChange = (_: any) => {};

    /**
     * The value from the FormControl
     *
     * @param obj the value from the parent form. Type "any" is required by the interface
     */
    public writeValue(obj: any): void {
        if (obj) {
            for (const key of Object.keys(obj)) {
                this.addNewAllocation(key, obj[key]);
            }
        }
    }

    /**
     * Hands changes back to the parent form
     *
     * @param fn the function to propagate the changes
     */
    public registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    /**
     * To satisfy the interface.
     *
     * @param fn
     */
    public registerOnTouched(fn: any): void {}

    /**
     * To satisfy the interface
     *
     * @param isDisabled
     */
    public setDisabledState?(isDisabled: boolean): void {}

    /**
     * Removes a custom allocation
     *
     * @param index the allocation to remove
     */
    public onRemoveAllocation(index: number): void {
        this.allocationBoxes.removeAt(index);
    }

    /**
     * Function to add a new allocation field to the form-array.
     * If values are passed, they are passed as the fields' value.
     *
     * @param entry The string to for which the allocation is made.
     * @param allocation The allocation value for the given string.
     */
    public async addNewAllocation(entry: string = ``, allocation: string | number = ``): Promise<void> {
        await firstValueFrom(this.configSubject.pipe(filter(config => !!config)));
        this.allocationBoxes.push(
            this.formBuilder.group({
                entry: [entry, Validators.required],
                allocation: [
                    this.isNumberAllocation ? this.getNumber(allocation) : String(allocation),
                    Validators.required
                ]
            })
        );
    }

    private getNumber(allocation: number | string): number {
        if (!Number.isNaN(+allocation) && +allocation > 0) {
            return +allocation;
        }
        return (
            Math.max(
                ...((this.allocationBoxes.value ?? []) as AllocationBox[]).map(value => +value.allocation).concat(0)
            ) + 1
        );
    }
}
