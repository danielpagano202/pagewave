import type { DirectionType } from '../types/DirectionType';
import type { OptionsType } from '../types/OptionsType';
import type { TimingType } from '../types/TimingType';
import type { TransitionStyle } from '../types/TransitionStyleInterface';

export class KeyFrameBase implements TransitionStyle {
    duration: number;
    timing: TimingType;
    constructor(duration: number, timing: TimingType = "linear") {
        this.duration = duration;
        this.timing = timing;
    }

    public handle(direction: DirectionType, mainElement: HTMLElement): void {}

    public hidePage(options: OptionsType): void {
        for(const ele of document.getElementsByClassName("pagewave-overlay-div")){
            ele.remove();
        }
        const mainContent = document.getElementById(options.mainContentIdName);
        if(mainContent){
            mainContent.hidden = true;
        }else{
            this.waitForElementLoad(
                `#${options.mainContentIdName}`, (element: HTMLElement) => {
                    element.hidden = true;
                 }
            )
        }
    }

    public revealPage(options: OptionsType): void {
        const mainContent = document.getElementById(options.mainContentIdName);
        if(mainContent){
            mainContent.hidden = false;
        }else{
            this.waitForElementLoad(
                `#${options.mainContentIdName}`, (element: HTMLElement) => {
                    element.hidden = false;
                }
            )
        }
    }

    protected waitForElementLoad(selector: string, functionToExecute: (element: HTMLElement) => void) {
        const existingElement = document.querySelector(selector);
        if (existingElement != null) {
            functionToExecute(existingElement as HTMLElement);
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as HTMLElement;
                        if (element.matches(selector)) {
                            observer.disconnect();
                            functionToExecute(element);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    protected ApplyAnimation(element: HTMLElement, animationName: string, duration: number, timing: TimingType, direction: DirectionType) {
        element.style.animation = `${animationName} ${duration}ms ${timing} both ${direction}`;
        setTimeout(() => {
            element.style.animation = "";
            if (direction == "normal") {
                element.hidden = true;
            }
        }, duration);
        if (direction == "reverse") {
            let currentAnimation: Animation | null = null;
            element.getAnimations().forEach((animation) => {
                if (currentAnimation == null && animation.id == animationName) {
                    currentAnimation = animation;
                }
            });

            function handleAnimation(event: AnimationEvent) {
                if (event.animationName == animationName && currentAnimation != null) {
                    const animationKeyframes = currentAnimation.effect! as KeyframeEffect;
                    const kfValues = Object.values(animationKeyframes.getKeyframes()[0]!);
                    const kfKeys = Object.keys(animationKeyframes.getKeyframes()[0]!);
                    const animationProperties = kfValues.slice(3, kfValues.length - 1);
                    const animationKeys = kfKeys.slice(3, kfValues.length - 1);
                    for (let i = 0; i < animationKeys.length; i++) {
                        const animationKey: string = animationKeys[i]!.toString();
                        const animationProperty: string = animationProperties[i]!.toString();
                        element.style.setProperty(animationKey, animationProperty);
                    }
                    element.style.animation = "";
                    element.removeEventListener("animationend", handleAnimation);
                }
            }
            element.addEventListener("animationend", handleAnimation);
        }
    }
}