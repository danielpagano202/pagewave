import type { DirectionType } from '../types/DirectionType';
import type { OptionsType } from '../types/OptionsType';
import type { TimingType } from '../types/TimingType';
import type { TransitionStyle } from '../types/TransitionStyleInterface';

export class OverlayBase implements TransitionStyle {
    duration: number;
    timing: TimingType;
    color: string;

    constructor(duration: number, color: string, timing: TimingType = "linear") {
        this.duration = duration;
        this.color = color;
        this.timing = timing;
    }

    public handle(direction: DirectionType, mainElement: HTMLElement): void {}

    public hidePage(options: OptionsType): void {
        const mainContent = document.getElementById(options.mainContentIdName)!;
        if (document.getElementById(options.pageBlockerId)) {
            const pageBlockerElement = document.getElementById(options.pageBlockerId)!;
            pageBlockerElement.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`
            return;
        }
        for(const ele of document.getElementsByClassName("pagewave-overlay-div")){
            ele.remove();
        }
        const pageBlocker = document.createElement('div');
        pageBlocker.id = options.pageBlockerId;
        pageBlocker.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`
        mainContent.append(pageBlocker);
    }

    public revealPage(options: OptionsType): void {
        const pageBlocker = document.getElementById(options.pageBlockerId);
        const mainElement = document.getElementById(options.mainContentIdName);
        if(mainElement){
            mainElement.hidden = false;
        }
        if (pageBlocker) {
            pageBlocker.style.cssText = '';
            //pageBlocker.remove();
        }else{
            this.waitForElementLoad(
                `#${options.pageBlockerId}`, (element: HTMLElement) => {
                    element.style.cssText = '';
                    //element.remove();
                }
            )
        }
    }

    private waitForElementLoad(selector: string, functionToExecute: (element: HTMLElement) => void) {
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
}