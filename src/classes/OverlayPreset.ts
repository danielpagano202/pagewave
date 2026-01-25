import type { DirectionType } from "../types/DirectionType";
import type { OverlayType } from "../types/OverlayType";
import type { TimingType } from "../types/TimingType";
import { OverlayCustom } from "./OverlayCustom";

export class OverlayPreset extends OverlayCustom{
    constructor(oType: OverlayType, duration: number, color: string, timing: TimingType = "linear") {
        const overlayMap: Record<OverlayType, Record<string, string>> = {
            slide: { firstOverlayElement: "slide" },
            inverseSlide: { firstOverlayElement: "inverseSlide" },
            curtain: { firstOverlayElement: "rightcurtain", secondOverlayElement: "leftcurtain" },
            rise: { firstOverlayElement: "rise" },
            fall: { firstOverlayElement: "fall" },
            bubble: { firstOverlayElement: "bubble" },
            wipe: { firstOverlayElement: "wipe" }

        };
        super(overlayMap[oType], duration, color, timing);
    }
    handle(direction: DirectionType, mainElement: HTMLElement): void {
        super.handle(direction, mainElement);
    }
}