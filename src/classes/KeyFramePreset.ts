import type { DirectionType } from "../types/DirectionType";
import type { KeyFrameType } from "../types/KeyFrameType";
import type { TimingType } from "../types/TimingType";
import { KeyFrameCustom } from "./KeyFrameCustom";

export class KeyFramePreset extends KeyFrameCustom {
    constructor(kfType: KeyFrameType, duration: number, timing: TimingType = "linear") {
        const animationMap: Record<KeyFrameType, string> = {
            fade: "fade",
            fadeaway: "fadeaway",
            fadetoleft: "fadetoleft",
            fadetoright: "fadetoright",
        };
        super(animationMap[kfType], duration, timing);
    }
    handle(direction: DirectionType, mainElement: HTMLElement): void {
        super.handle(direction, mainElement);
    }
}