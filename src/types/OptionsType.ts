export type OptionsType = {
    mainContentIdName: string;
    pageAnimationDelay: number;
    runAnimationOnPageReload: boolean;
    runAnimationOnCrossSite: boolean;
    pageRevealDelay: number;
    leavePageOnLink: boolean;
    pageBlockerId: string;
    classToIgnoreLink: string;
    animateIgnoredLinks: boolean;
    animateSelfLink: boolean;
    loadEvent: "DOMContentLoaded" | "load";
    preferIgnore: boolean;
}