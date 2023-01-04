import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { Selectable } from 'src/app/domain/interfaces/selectable';

@Component({
    selector: `os-motion-extension-field`,
    templateUrl: `./motion-extension-field.component.html`,
    styleUrls: [`./motion-extension-field.component.scss`]
})
export class MotionExtensionFieldComponent implements OnInit, OnDestroy {
    /**
     * Optional additional classes for the `mat-chip`.
     */
    @Input()
    public classes: string | string[] | object = `bluegrey`;

    /**
     * Title for this component.
     */
    @Input()
    public title!: string;

    /**
     * Value of the chip.
     */
    @Input()
    public chipValue!: string;

    /**
     * Boolean, whether the extension should be shown.
     */
    @Input()
    public hasExtension = false;

    /**
     * Optional label for the input.
     */
    @Input()
    public extensionLabel!: string;

    /**
     * Optional labels for the search-lists.
     */
    @Input()
    public searchListLabels!: string[];

    /**
     * BehaviourSubjects for the search-lists.
     */
    @Input()
    public searchLists: Observable<Selectable[]>[] = [];

    /**
     * Whether or not to keep the search lists open after a selection.
     */
    @Input()
    public searchListsKeepOpen: boolean[] = [];

    /**
     * Boolean, whether the input and the search-list can be changed.
     */
    @Input()
    public canBeEdited = true;

    @Input()
    public listValueTransformFns: ((value: Selectable) => string)[] = [];

    /**
     * Initial value of the input-field.
     */
    @Input()
    public inputValue!: string;

    /**
     * EventEmitter, when clicking on the 'save'-button.
     */
    @Output()
    public succeeded = new EventEmitter<string>();

    /**
     * Model for the input-field.
     */
    public inputControl = ``;

    /**
     * FormGroup for the search-list.
     */
    public extensionFieldForm!: UntypedFormGroup;

    /**
     * Boolean to decide, whether to open the extension-input and search-list.
     */
    public editMode = false;

    /**
     * Hold the nav subscription
     */
    private navigationSubscription!: Subscription;

    /**
     * Subscription for the search value selector
     */
    private searchValueSubscription!: Subscription;

    private searchListValues?: Selectable[][] = [];
    private searchListSubscriptions?: Subscription[] = [];

    private searchListConsecutiveSelections: boolean[] = [];

    /**
     * Constructor
     *
     * @param formBuilder The FormBuilder
     */
    public constructor(private formBuilder: UntypedFormBuilder, private router: Router) {}

    /**
     * OnInit-method.
     */
    public ngOnInit(): void {
        this.navigationSubscription = this.router.events.subscribe(navEvent => {
            if (navEvent instanceof NavigationEnd) {
                this.editMode = false;

                if (this.extensionFieldForm) {
                    this.extensionFieldForm.reset();
                }
            }
        });

        this.initInput();

        const lists = {};
        for (let i = 0; i < this.searchLists.length; i++) {
            lists[`list${i}`] = [[]];
            if (this.searchListLabels.length <= i) {
                this.searchListLabels.push(``);
            }
            if (this.listValueTransformFns.length <= i) {
                this.listValueTransformFns.push(value => value.getTitle());
            }
            this.searchListValues.push([]);
        }

        this.extensionFieldForm = this.formBuilder.group(lists);

        for (let i = 0; i < this.searchLists.length; i++) {
            this.searchListSubscriptions.concat(
                this.searchLists[i].subscribe(list => (this.searchListValues[i] = list))
            );

            this.searchValueSubscription = this.extensionFieldForm
                .get(`list${i}`)
                .valueChanges.pipe(distinctUntilChanged())
                .subscribe((value: any) => {
                    const transformFn = this.listValueTransformFns[i];
                    if (value && typeof value === `number`) {
                        if (!this.inputControl) {
                            this.inputControl = ``;
                        } else if (this.searchListConsecutiveSelections[i]) {
                            this.inputControl += ` · `;
                        }
                        this.searchListConsecutiveSelections[i] = true;
                        this.inputControl += transformFn(this.searchListValues[i].find(entry => entry.id === value));
                    }
                    this.extensionFieldForm.reset();
                });
        }
    }

    /**
     * On destroy unsubscribe from the subscriptions
     */
    public ngOnDestroy(): void {
        this.navigationSubscription.unsubscribe();
        if (this.searchValueSubscription) {
            this.searchValueSubscription.unsubscribe();
        }
        if (this.searchListSubscriptions?.length) {
            this.searchListSubscriptions.forEach(subscription => subscription.unsubscribe());
        }
    }

    /**
     * Hitting enter on the input field should save the content
     */
    public keyDownFunction(event: any): void {
        if (event.key === `Enter`) {
            this.changeEditMode(true);
        }
    }

    /**
     * Function to switch to or from editing-mode.
     *
     * @param save Boolean, whether the changes should be saved or resetted.
     */
    public changeEditMode(save: boolean = false): void {
        if (save) {
            this.sendSuccess();
        } else {
            this.initInput();
        }
        this.editMode = !this.editMode;
    }

    /**
     * Initialize the value of the input.
     */
    public initInput(): void {
        this.inputControl = this.inputValue;
    }

    /**
     * Function to execute, when the values are saved.
     */
    public sendSuccess(): void {
        this.succeeded.emit(this.inputControl);
    }

    public openedChange(opened: boolean, i: number): void {
        if (!opened) {
            this.searchListConsecutiveSelections[i] = false;
        }
    }
}
