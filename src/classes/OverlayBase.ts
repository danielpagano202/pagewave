import type { DirectionType } from "../types/DirectionType";
import type { OptionsType } from "../types/OptionsType";
import type { TimingType } from "../types/TimingType";
import type { TransitionStyle } from "../types/TransitionStyleInterface";

export class OverlayBase implements TransitionStyle {
    duration: number;
    timing: TimingType;
    color: string;
    transitionName: string = "Overlay";

    constructor(duration: number, color: string, timing: TimingType = "linear") {
        this.duration = duration;
        this.color = color;
        this.timing = timing;
    }

    public async handle(direction: DirectionType, mainElement: HTMLElement): Promise<void> {}

    public hidePage(options: OptionsType): void {
        const mainContent = document.getElementById(options.mainContentIdName)!;
        const pageBlockerElement = document.getElementById(options.pageBlockerId);
        if (pageBlockerElement) {
            pageBlockerElement!.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`;
            return;
        }

        for (const ele of document.getElementsByClassName("pagewave-overlay-div")) {
            ele.remove();
        }
        const pageBlocker = document.createElement("div");
        pageBlocker.id = options.pageBlockerId;
        pageBlocker.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${this.color}`;
        mainContent.append(pageBlocker);
    }

    public revealPage(options: OptionsType): void {
        const pageBlocker = document.getElementById(options.pageBlockerId);
        const mainElement = document.getElementById(options.mainContentIdName);
        if (mainElement) {
            mainElement.hidden = false;
        }

        if (pageBlocker) {
            pageBlocker.style.cssText = "";
            //pageBlocker.remove();
        } else {
            this.waitForElementLoad(`#${options.pageBlockerId}`).then((element: HTMLElement) => {
                element.style.cssText = "";
                //element.remove();
            });
        }
    }

    protected async waitForElementLoad(selector: string): Promise<HTMLElement> {
        const existingElement = document.querySelector(selector);
        if (existingElement != null) {
            return existingElement as HTMLElement;
        }

        return new Promise<HTMLElement>((resolve) => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;
                            if (element.matches(selector)) {
                                observer.disconnect();
                                resolve(element);
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
}
