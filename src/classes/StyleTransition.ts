import type { DirectionType } from "../types/DirectionType";
import type { TimingType } from "../types/TimingType";
import type { TransitionStyle } from "../types/TransitionStyleInterface";
import  { KeyFrameBase } from "./KeyFrameBase";

export class StyleTransition extends KeyFrameBase {
    styleString: keyof CSSStyleDeclaration;
    startValue: string;
    endValue: string;
    constructor(styleString: keyof CSSStyleDeclaration, duration: number, startValue: string, endValue: string, timing: TimingType = "linear") {
        super(duration, timing);
        this.styleString = styleString;
        this.startValue = startValue
        this.endValue = endValue;
    }

    handle(direction: DirectionType, mainElement: HTMLElement): void {
        if (direction == "normal") {
            (mainElement.style as any)[this.styleString] = this.startValue;
            mainElement.style.transition = this.styleString.toString() + " " + this.duration.toString() + "ms " + this.timing;
            (mainElement.style as any)[this.styleString] = this.endValue;
        } else if (direction == "reverse") {
            (mainElement.style as any)[this.styleString] = this.endValue;
            mainElement.style.transition = this.styleString.toString() + " " + this.duration.toString() + "ms " + this.timing;
            setTimeout(
                () => {
                     (mainElement.style as any)[this.styleString] = this.startValue;
                }, 40
            );

        }
    }
}