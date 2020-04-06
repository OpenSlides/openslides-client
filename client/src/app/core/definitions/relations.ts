import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';

type _ViewModelConstructor = ViewModelConstructor<BaseViewModel>;

export type StructuredRelation<Argument, Result> = (args: Argument) => Result;

export interface Relation {
    ownViewModels: _ViewModelConstructor[]; // the default-case is exactly one entry for non-generic relations
    foreignViewModel?: _ViewModelConstructor; // given on generic=false
    foreignViewModelPossibilities?: _ViewModelConstructor[]; // given on generic=true
    ownField: string;
    ownIdField: string;
    many: boolean;
    generic: boolean;
    structured: boolean;
    order?: string; // may be given on many=true. if not given on many=true, the models are sorted by id.
    ownIdFieldDefaultAttribute?: 'active-meeting'; // may be given if structured=true
    ownIdFieldPrefix?: string; // given, if structured=true
    ownIdFieldSuffix?: string; // given, if structured=true
}

export function makeO2O(args: {
    AViewModel: _ViewModelConstructor;
    BViewModel: _ViewModelConstructor;
    AField: string;
    BField: string;
    AIdField?: string;
    BIdField?: string;
}): Relation[] {
    return [
        // A -> B
        {
            ownViewModels: [args.AViewModel],
            foreignViewModel: args.BViewModel,
            ownField: args.AField,
            ownIdField: args.AIdField,
            many: false,
            generic: false,
            structured: false
        },
        // B -> A
        {
            ownViewModels: [args.BViewModel],
            foreignViewModel: args.AViewModel,
            ownField: args.BField,
            ownIdField: args.BIdField,
            many: false,
            generic: false,
            structured: false
        }
    ];
}

export function makeM2O(args: {
    OViewModel: _ViewModelConstructor;
    MViewModel: _ViewModelConstructor;
    OField: string;
    MField: string;
    OIdField?: string;
    MIdField?: string;
    order?: string;
}): Relation[] {
    return [
        // M -> O
        {
            ownViewModels: [args.MViewModel],
            foreignViewModel: args.OViewModel,
            ownField: args.MField,
            ownIdField: args.MIdField,
            many: false,
            generic: false,
            structured: false
        },
        // O -> M
        {
            ownViewModels: [args.OViewModel],
            foreignViewModel: args.MViewModel,
            ownField: args.OField,
            ownIdField: args.OIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.order
        }
    ];
}

export function makeM2M(args: {
    AViewModel: _ViewModelConstructor;
    BViewModel: _ViewModelConstructor;
    AField: string;
    BField: string;
    AIdField?: string;
    BIdField?: string;
    AOrder?: string;
    BOrder?: string;
}): Relation[] {
    return [
        // A -> B
        {
            ownViewModels: [args.AViewModel],
            foreignViewModel: args.BViewModel,
            ownField: args.AField,
            ownIdField: args.AIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.BOrder
        },
        // B -> A
        {
            ownViewModels: [args.BViewModel],
            foreignViewModel: args.AViewModel,
            ownField: args.BField,
            ownIdField: args.BIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.AOrder
        }
    ];
}

export function makeGenericO2O(args: {
    viewModel: _ViewModelConstructor;
    possibleViewModels: _ViewModelConstructor[];
    viewModelField: string;
    possibleViewModelsField: string;
    viewModelIdField?: string;
    possibleViewModelsIdField?: string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.viewModel],
            foreignViewModelPossibilities: args.possibleViewModels,
            ownField: args.viewModelField,
            ownIdField: args.viewModelIdField,
            many: false,
            generic: true,
            structured: false
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.possibleViewModels,
            foreignViewModel: args.viewModel,
            ownField: args.possibleViewModelsField,
            ownIdField: args.possibleViewModelsIdField,
            many: false,
            generic: false,
            structured: false
        }
    ];
}

export function makeGenericM2M(args: {
    viewModel: _ViewModelConstructor;
    possibleViewModels: _ViewModelConstructor[];
    viewModelField: string;
    possibleViewModelsField: string;
    viewModelIdField?: string;
    possibleViewModelsIdField?: string;
    viewModelorder?: string;
    possibleViewModelsOrder?: string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.viewModel],
            foreignViewModelPossibilities: args.possibleViewModels,
            ownField: args.viewModelField,
            ownIdField: args.viewModelIdField,
            many: true,
            generic: true,
            structured: false,
            order: args.possibleViewModelsOrder
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.possibleViewModels,
            foreignViewModel: args.viewModel,
            ownField: args.possibleViewModelsField,
            ownIdField: args.possibleViewModelsIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.viewModelorder
        }
    ];
}

export function makeStructuredO2O(args: {
    structuredViewModel: _ViewModelConstructor;
    otherViewModel: _ViewModelConstructor;
    structuredField: string;
    structuredIdField: string;
    structuredIdFieldDefaultAttribute?: 'active-meeting';
    otherViewModelField: string;
    otherViewModelIdField: string;
}): Relation[] {
    return [
        // structured -> other
        {
            ownViewModels: [args.structuredViewModel],
            foreignViewModel: args.otherViewModel,
            ownField: args.structuredField,
            ownIdField: args.structuredIdField,
            many: false,
            generic: false,
            structured: true,
            ownIdFieldDefaultAttribute: args.structuredIdFieldDefaultAttribute
        },
        // possible view models -> viewModel
        {
            ownViewModels: [args.otherViewModel],
            foreignViewModel: args.structuredViewModel,
            ownField: args.otherViewModelField,
            ownIdField: args.otherViewModelIdField,
            many: false,
            generic: false,
            structured: false
        }
    ];
}

export function makeStructuredM2M(args: {
    structuredViewModel: _ViewModelConstructor;
    otherViewModel: _ViewModelConstructor;
    structuredField: string;
    structuredIdField: string;
    otherViewModelField: string;
    otherViewModelIdField?: string;
    structuredIdFieldDefaultAttribute?: 'active-meeting';
    structuredOrder?: string;
    otherViewModelOrder?: string;
}): Relation[] {
    return [
        // structured -> other
        {
            ownViewModels: [args.structuredViewModel],
            foreignViewModel: args.otherViewModel,
            ownField: args.structuredField,
            ownIdField: args.structuredIdField,
            many: true,
            generic: false,
            structured: true,
            ownIdFieldDefaultAttribute: args.structuredIdFieldDefaultAttribute,
            order: args.otherViewModelOrder
        },
        // possible view models -> viewModel
        {
            ownViewModels: [args.otherViewModel],
            foreignViewModel: args.structuredViewModel,
            ownField: args.otherViewModelField,
            ownIdField: args.otherViewModelIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.structuredOrder
        }
    ];
}
