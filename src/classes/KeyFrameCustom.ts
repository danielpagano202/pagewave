import type { DirectionType } from '../types/DirectionType';
import type { OptionsType } from '../types/OptionsType';
import type { TimingType } from '../types/TimingType';
import type { TransitionStyle } from '../types/TransitionStyleInterface';
import { KeyFrameBase } from './KeyFrameBase';

export class KeyFrameCustom extends KeyFrameBase {
    animationName: string;
    constructor(animationName: string, duration: number, timing: TimingType = "linear") {
        super(duration, timing);
        this.animationName = animationName;
    }

    public handle(direction: DirectionType, mainElement: HTMLElement): void {
        mainElement.hidden = false;
        this.ApplyAnimation(mainElement, this.animationName, this.duration, this.timing, direction);
    }
}