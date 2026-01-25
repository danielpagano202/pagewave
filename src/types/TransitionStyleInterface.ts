import type { DirectionType } from "./DirectionType";
import type { OptionsType } from "./OptionsType";
import { TimingType } from "./TimingType";

export interface TransitionStyle {
    duration: number; // Duration in milliseconds
    timing?: TimingType // Optional timing function, e.g., "linear", "ease-in-out"

    handle(direction: DirectionType, mainElement: HTMLElement): void;

    hidePage(options: OptionsType): void;
    revealPage(options: OptionsType): void;
}