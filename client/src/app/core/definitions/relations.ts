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

export function makeO2O<A extends BaseViewModel, B extends BaseViewModel>(args: {
    AViewModel: ViewModelConstructor<A>;
    BViewModel: ViewModelConstructor<B>;
    AField: keyof A & string;
    BField: keyof B & string;
    AIdField?: keyof A & string;
    BIdField?: keyof B & string;
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

export function makeM2O<O extends BaseViewModel, M extends BaseViewModel>(args: {
    OViewModel: ViewModelConstructor<O>;
    MViewModel: ViewModelConstructor<M>;
    OField: keyof O & string;
    MField: keyof M & string;
    OIdField?: keyof O & string;
    MIdField?: keyof M & string;
    order?: keyof M & string;
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

export function makeM2M<A extends BaseViewModel, B extends BaseViewModel>(args: {
    AViewModel: ViewModelConstructor<A>;
    BViewModel: ViewModelConstructor<B>;
    AField: keyof A & string;
    BField: keyof B & string;
    AIdField?: keyof A & string;
    BIdField?: keyof B & string;
    AOrder?: keyof A & string;
    BOrder?: keyof B & string;
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

export function makeGenericO2O<V extends BaseViewModel, I>(args: {
    viewModel: ViewModelConstructor<V>;
    possibleViewModels: ViewModelConstructor<BaseViewModel & I>[];
    viewModelField: keyof V & string;
    possibleViewModelsField: keyof I & string;
    viewModelIdField?: keyof V & string;
    possibleViewModelsIdField?: keyof I & string;
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

export function makeGenericO2M<V extends BaseViewModel, I>(args: {
    OViewModel: ViewModelConstructor<V>;
    MPossibleViewModels: ViewModelConstructor<BaseViewModel & I>[];
    OViewModelField: keyof V & string;
    MPossibleViewModelsField: keyof I & string;
    OViewModelIdField?: keyof V & string;
    MPossibleViewModelsIdField?: keyof I & string;
    OViewModelOrder?: keyof I & string;
}): Relation[] {
    return [
        // viewModel -> possible view models
        {
            ownViewModels: [args.OViewModel],
            foreignViewModelPossibilities: args.MPossibleViewModels,
            ownField: args.OViewModelField,
            ownIdField: args.OViewModelIdField,
            many: false,
            generic: true,
            structured: false
        },
        // possible view models -> viewModel
        {
            ownViewModels: args.MPossibleViewModels,
            foreignViewModel: args.OViewModel,
            ownField: args.MPossibleViewModelsField,
            ownIdField: args.MPossibleViewModelsIdField,
            many: true,
            generic: false,
            structured: false,
            order: args.OViewModelOrder
        }
    ];
}

export function makeGenericM2M<V extends BaseViewModel, I>(args: {
    viewModel: ViewModelConstructor<V>;
    possibleViewModels: ViewModelConstructor<BaseViewModel & I>[];
    viewModelField: keyof V & string;
    possibleViewModelsField: keyof I & string;
    viewModelIdField?: keyof V & string;
    possibleViewModelsIdField?: keyof I & string;
    viewModelOrder?: keyof V & string;
    possibleViewModelsOrder?: keyof I & string;
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
            order: args.viewModelOrder
        }
    ];
}
