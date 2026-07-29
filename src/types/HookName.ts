export type HookName =
    /** Animation start, forward direction */
    | "pagewaveStartForwardTransition"
    /** Animation start, reverse direction */
    | "pagewaveStartReverseTransition"
    /** Animation end, forward direction */
    | "pagewaveEndForwardTransition"
    /** Animation end, reverse direction */
    | "pagewaveEndReverseTransition"
    /** Start of Send Point listening (when a link is clicked) */
    | "pagewaveStartSendPoint"
    /** End of Send Point listen (when the animation is handled) */
    | "pagewaveEndSendPoint"
    /** Start of end point listen (when the load event is dispatched) */
    | "pagewaveStartEndPoint"
    /** End of end point (when the page is revealed after an animation) */
    | "pagewaveEndEndPoint"
    /** End point no animation played (when the page is revealed but no animation was played) */
    | "pagewaveEndPointNoTransition";
