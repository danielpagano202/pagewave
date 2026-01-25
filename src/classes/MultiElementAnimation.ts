import type { DirectionType } from "../types/DirectionType";
import type { TimingType } from "../types/TimingType";
import { KeyFrameBase } from "./KeyFrameBase";

export class MultiElementAnimation extends KeyFrameBase {
    animateableObjects: { [selector: string]: string };
    mainElementAnimation: string;

    constructor(animateableObjects: { [selector: string]: string }, duration: number, timing: TimingType = "linear", mainElementAnimation = "") {
        super(duration, timing);
        this.animateableObjects = animateableObjects;
        this.mainElementAnimation = mainElementAnimation;
    }
    public handle(direction: DirectionType, mainElement: HTMLElement): void {
        let timing = this.timing;
        for (const [selector, animationName] of Object.entries(this.animateableObjects)) {
            mainElement.querySelectorAll(selector).forEach(
                (element) => {
                    this.ApplyAnimation(element as HTMLElement, animationName, this.duration, timing, direction);
                }
            );
        }
        if (this.mainElementAnimation != "") {
            this.ApplyAnimation(mainElement, this.mainElementAnimation, this.duration, timing, direction);
        }
    }
}