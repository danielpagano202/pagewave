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

    public async handle(direction: DirectionType, mainElement: HTMLElement): Promise<void> {
        mainElement.hidden = false;
        await this.ApplyAnimation(mainElement, this.animationName, this.duration, this.timing, direction);
    }
}