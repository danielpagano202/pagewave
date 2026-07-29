import type { DirectionType } from "../types/DirectionType";
import type { OptionsType } from "../types/OptionsType";
import type { TimingType } from "../types/TimingType";
import type { KeyFrameBase } from "./KeyFrameBase";
import { OverlayBase } from "./OverlayBase";

export type OverlayStyledDiv = {
    animationName: string;
    cssDesign: Partial<Record<keyof CSSStyleDeclaration, string>>;
};

export class OverlayStyled extends OverlayBase {
    divAnimationObject: Record<string, OverlayStyledDiv>;
    mainElementAnimation: KeyFrameBase | null;
    blockerDesign: Partial<Record<keyof CSSStyleDeclaration, string>>;

    constructor(divAnimationObject: Record<string, OverlayStyledDiv>, duration: number, color: string, timing: TimingType = "linear", mainElementAnimation: KeyFrameBase | null = null, blockerDesign: Partial<Record<keyof CSSStyleDeclaration, string>> = {}) {
        super(duration, color, timing);
        this.divAnimationObject = divAnimationObject;
        this.mainElementAnimation = mainElementAnimation;
        this.blockerDesign = blockerDesign;
    }

    public hidePage(options: OptionsType): void {
        for (const ele of document.querySelectorAll(".pagewave-overlay-div")) {
            ele.remove();
        }

        const mainContent = document.getElementById(options.mainContentIdName)!;
        const pageBlockerElement = document.getElementById(options.pageBlockerId);
        if (pageBlockerElement) {
            pageBlockerElement.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`;
            for (const [styleKey, styleValue] of Object.entries(this.blockerDesign)) {
                (pageBlockerElement.style as any)[styleKey] = styleValue;
            }
            return;
        }

        const pageBlocker = document.createElement("div");
        pageBlocker.id = options.pageBlockerId;
        pageBlocker.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`;
        for (const [styleKey, styleValue] of Object.entries(this.blockerDesign)) {
            (pageBlocker.style as any)[styleKey] = styleValue;
        }
        mainContent.append(pageBlocker);
    }

    async handle(direction: DirectionType, mainElement: HTMLElement): Promise<void> {
        for (const ele of document.querySelectorAll(".pagewave-overlay-div")) {
            ele.remove();
        }

        let animations: Promise<void>[] = [];
        const root = document.documentElement;
        root.style.setProperty("--div-color", this.color);

        for (const [className, divProperties] of Object.entries(this.divAnimationObject)) {
            const divElement = document.createElement("div");
            divElement.className = className + " pagewave-overlay-div";
            divElement.style.animation = `${divProperties.animationName} ${this.duration}ms ${this.timing} both ${direction}`;
            divElement.style.backgroundColor = this.color;
            divElement.style.position = "absolute";

            for (const [styleKey, styleValue] of Object.entries(divProperties.cssDesign)) {
                (divElement.style as any)[styleKey] = styleValue;
            }

            mainElement.appendChild(divElement);
            animations.push(new Promise<void>((resolve) => setTimeout(resolve, this.duration)));
            //TODO: this was in the old setTimeout, but it was not doing anything. Should we keep it or remove it?
            //mainElement.removeChild(divElement);
        }

        if (this.mainElementAnimation !== null) {
            await this.mainElementAnimation.handle(direction, mainElement);
        } else {
            await Promise.all(animations);
        }
    }
}
