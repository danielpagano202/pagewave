import type { DirectionType } from "./DirectionType";
import type { OptionsType } from "./OptionsType";
import { TimingType } from "./TimingType";

export interface TransitionStyle {
    duration: number; // Duration in milliseconds
    timing?: TimingType; // Optional timing function, e.g., "linear", "ease-in-out"
    transitionName: string; // Optional name of the transition for defaults

    handle(direction: DirectionType, mainElement: HTMLElement): Promise<void>;

    hidePage(options: OptionsType): void;
    revealPage(options: OptionsType): void;
}
