/**
 * Directions for scale and scroll requests.
 */
export enum ScrollScaleDirection {
    Up = `up`,
    Down = `down`,
    Reset = `reset`
}

export class ProjectorAction {
    public static readonly CREATE = `projector.create`;
    public static readonly UPDATE = `projector.update`;
    public static readonly DELETE = `projector.delete`;
    public static readonly CONTROL_VIEW = `projector.control_view`;
    public static readonly PROJECT = `projector.project`;
    public static readonly TOGGLE = `projector.toggle`;
    public static readonly NEXT = `projector.next`;
    public static readonly PREVIOUS = `projector.previous`;
    public static readonly ADD_TO_PREVIEW = `projector.add_to_preview`;
    public static readonly PROJECT_PREVIEW = `projector.project_preview`;
    public static readonly SORT_PREVIEW = `projector.sort_preview`;
}
