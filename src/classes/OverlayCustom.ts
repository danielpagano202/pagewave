import type { DirectionType } from '../types/DirectionType';
import type { TimingType } from '../types/TimingType';
import type { KeyFrameBase } from './KeyFrameBase';
import { OverlayBase } from './OverlayBase';

// ...existing code...
export class OverlayCustom extends OverlayBase {
    divAnimationObject: Record<string, string>;
    mainElementAnimation: KeyFrameBase | null;

    constructor(divAnimationObject: Record<string, string>, duration: number, color: string, timing: TimingType = "linear", mainElementAnimation: KeyFrameBase | null = null) {
        super(duration, color, timing);
        this.divAnimationObject = divAnimationObject;
        this.mainElementAnimation = mainElementAnimation;
    }

    handle(direction: DirectionType, mainElement: HTMLElement): void {
        for(const ele of document.getElementsByClassName("pagewave-overlay-div")){
            ele.remove();
        }
        const root = document.documentElement;
        root.style.setProperty("--div-color", this.color);
        for (const [className, animationName] of Object.entries(this.divAnimationObject)) {
            const divElement = document.createElement("div");
            divElement.className = className + " pagewave-overlay-div";
            divElement.style.animation = `${animationName} ${this.duration}ms ${this.timing} both ${direction}`;
            divElement.style.backgroundColor = this.color;
            
            divElement.style.position = "absolute";
            mainElement.appendChild(divElement);
            setTimeout(() => {
                if(divElement.parentElement == mainElement){
                    mainElement.removeChild(divElement);
                }
            }, this.duration);
        }

        if (this.mainElementAnimation !== null) {
            this.mainElementAnimation.handle(direction, mainElement);
        }
    }
}