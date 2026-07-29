import { TransitionStyle } from "./TransitionStyleInterface";

export type SendTransitionRequest = {
    defaultTransitionStyle: TransitionStyle;
    shouldRunTransition?: (transitionStyle: TransitionStyle, anchorElement: HTMLAnchorElement) => Promise<boolean>;
    leaveFunction?: (link: string) => void;
    externalLeaveFunction?: (link: string) => void;
};
