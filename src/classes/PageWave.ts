import type { DirectionType } from "../types/DirectionType.ts";
import { EndTransitionRequest } from "../types/EndTransitionRequest.js";
import { HookName } from "../types/HookName.js";
import { HookType } from "../types/HookType.js";
import { ListenForChangeRequest } from "../types/ListenForChangeRequest.js";
import type { OptionsType } from "../types/OptionsType.ts";
import { SendTransitionRequest } from "../types/SendTransitionRequest.js";
import type { TransitionStyle } from "../types/TransitionStyleInterface.ts";

export class PageWave {
    public defaultOptions: OptionsType;
    public finalOptions: OptionsType;
    public routeTransitions: Record<string, TransitionStyle>;
    public hookCallbacks: ((eventName: HookName, info: HookType) => void)[];
    constructor(transitions: Record<string, TransitionStyle>, options: Partial<OptionsType> = {}) {
        this.defaultOptions = {
            mainContentIdName: "main-content",
            pageAnimationDelay: 100,
            runAnimationOnPageReload: false,
            runAnimationOnCrossSite: false,
            pageRevealDelay: 0,
            leavePageOnLink: true,
            pageBlockerId: "pageBlocker",
            classToIgnoreLink: "ignore-click",
            animateIgnoredLinks: false,
            animateSelfLink: true,
            loadEvent: "DOMContentLoaded",
            preferIgnore: false,
            customIsLinkSamePageFunction: (link) => link == window.location.href,
        };
        this.finalOptions = { ...this.defaultOptions, ...options };
        this.routeTransitions = transitions;
        this.hookCallbacks = [];
    }

    // Helper functions

    private CallHook(hookName: HookName, details: HookType) {
        const event = new CustomEvent(hookName, {
            detail: details,
        });
        window.dispatchEvent(event);
        this.hookCallbacks.forEach((callback) => {
            callback(hookName, details);
        });
    }

    private isPreviousPageFromSameSite() {
        const referrer = document.referrer;
        if (referrer == "") {
            return false;
        }
        const currentHost = window.location.hostname;
        const referrerHost = new URL(referrer).hostname;

        return referrerHost === currentHost;
    }

    private isInternalLink(link: string): boolean {
        try {
            const url = new URL(link, window.location.href); // handles relative URLs
            return url.hostname === window.location.hostname;
        } catch (e) {
            // invalid URLs are considered external
            return false;
        }
    }

    private fillSendTransitionRequestWithDefaults(parameters: SendTransitionRequest): Required<SendTransitionRequest> {
        return {
            defaultTransitionStyle: parameters.defaultTransitionStyle,
            shouldRunTransition: () => {
                return true;
            },
            leaveFunction:
                parameters.leaveFunction ??
                ((link) => {
                    window.location.href = link;
                }),
            externalLeaveFunction:
                parameters.externalLeaveFunction ??
                ((link) => {
                    window.location.href = link;
                }),
        };
    }

    // Core Public Methods

    public CreateHookCallback(callback: (eventName: HookName, info: HookType) => void) {
        this.hookCallbacks.push(callback);
    }

    public ListenForChange(parameters: ListenForChangeRequest) {
        this.EndPoint(parameters.endTransitionRequest);
        this.SendPoint(parameters.sendTransitionRequest);
    }

    // Send point functions

    private async HandleClickAnimation(e: MouseEvent, initialParameters: SendTransitionRequest) {
        let parameters = this.fillSendTransitionRequestWithDefaults(initialParameters);

        e.preventDefault();
        e.stopPropagation();
        const eventTarget: HTMLAnchorElement | null = (e.target as HTMLElement).closest("a");

        if (!eventTarget || !eventTarget.href) {
            return;
        }

        const matchedRoute = Array.from(eventTarget.classList).find((cls: string) => cls in this.routeTransitions);
        const shouldIgnore = this.finalOptions.preferIgnore && !matchedRoute;

        if (!shouldIgnore && (!this.finalOptions.customIsLinkSamePageFunction(eventTarget.href) || this.finalOptions.animateSelfLink)) {
            this.CallHook("pagewaveStartSendPoint", {
                style: parameters.defaultTransitionStyle,
                event: e,
                pagewave: this,
            });

            const transitionToUse = this.routeTransitions[matchedRoute ?? ""] ?? parameters.defaultTransitionStyle;
            const transitionNameToSave = matchedRoute ?? parameters.defaultTransitionStyle.transitionName;
            if (!parameters.shouldRunTransition(transitionToUse, eventTarget)) {
                return;
            }

            await this.SaveAnimationTypeAndTransition(transitionNameToSave, transitionToUse!);
        } else {
            sessionStorage.setItem("animationType", "ignore");
        }
        this.CallHook("pagewaveEndSendPoint", {
            style: parameters.defaultTransitionStyle,
            event: e,
            pagewave: this,
        });
        if (this.finalOptions.leavePageOnLink) {
            const correctLeaveFunction = this.isInternalLink(eventTarget.href) ? parameters.leaveFunction : parameters.externalLeaveFunction;
            correctLeaveFunction(eventTarget.href);
        }
    }

    public SendPoint(parameters: SendTransitionRequest) {
        let linkElements = Array.from(document.querySelectorAll("a"));
        linkElements.filter((x) => !x.classList.contains(this.finalOptions.classToIgnoreLink));
        linkElements.forEach((el) => {
            el.onclick = null;
            el.addEventListener(
                "click",
                (e) => {
                    this.HandleClickAnimation(e, parameters);
                },
                { once: true },
            );
        });
    }

    // End point functions

    public getStorageRouteTransition(defaultTransitionStyle: TransitionStyle): TransitionStyle {
        const storageKey = sessionStorage.getItem("animationType");
        if (storageKey != null && storageKey in this.routeTransitions) {
            return this.routeTransitions[storageKey]!;
        }
        return defaultTransitionStyle;
    }

    public EndPoint(parameters: EndTransitionRequest) {
        parameters.defaultTransitionStyle = this.getStorageRouteTransition(parameters.defaultTransitionStyle);
        parameters.defaultTransitionStyle.hidePage(this.finalOptions);

        const mainElement = document.getElementById(this.finalOptions.mainContentIdName);

        if (!mainElement) {
            console.error(`Element with ID '${this.finalOptions.mainContentIdName}' not found.`);
            return;
        }

        mainElement.addEventListener(
            this.finalOptions.loadEvent,
            async (e) => {
                e.stopPropagation();
                this.CallHook("pagewaveStartEndPoint", { style: parameters.defaultTransitionStyle, pagewave: this });

                const doTransitionOnIgnoredLink = this.finalOptions.animateIgnoredLinks || sessionStorage.getItem("animationType") != "ignore";
                const doAnimateOnReload = window.performance.getEntriesByType("navigation")[0]?.entryType != "reload" || this.finalOptions.runAnimationOnPageReload;
                const doAnimateOnSameSite = this.isPreviousPageFromSameSite() || this.finalOptions.runAnimationOnCrossSite;

                if (doAnimateOnReload && doAnimateOnSameSite && doTransitionOnIgnoredLink) {
                    await new Promise((resolve) => setTimeout(resolve, this.finalOptions.pageAnimationDelay));
                    this.AnimatePageTransition(parameters.defaultTransitionStyle, "reverse");

                    await new Promise((resolve) => setTimeout(resolve, this.finalOptions.pageRevealDelay));
                    this.CallHook("pagewaveEndEndPoint", { style: parameters.defaultTransitionStyle, pagewave: this });
                } else {
                    this.CallHook("pagewaveEndPointNoTransition", { style: parameters.defaultTransitionStyle, pagewave: this });
                }
                parameters.defaultTransitionStyle.revealPage(this.finalOptions);
                sessionStorage.setItem("animationType", "ignore");
            },
            { once: true },
        );
    }

    public CallEndPoint() {
        const dispatchEvent = new Event(this.finalOptions.loadEvent);
        document.getElementById(this.finalOptions.mainContentIdName)!.dispatchEvent(dispatchEvent);
    }

    // Animation functions

    public async SaveAnimationTypeAndTransition(animationName: string, aStyle: TransitionStyle, direction: DirectionType = "normal") {
        sessionStorage.setItem("animationType", animationName);
        await this.AnimatePageTransition(aStyle, direction);
    }

    public async AnimatePageTransition(aStyle: TransitionStyle, direction: DirectionType = "normal") {
        const mainElement = document.getElementById(this.finalOptions.mainContentIdName)!;

        if (direction == "normal") {
            this.CallHook("pagewaveStartForwardTransition", { style: aStyle, pagewave: this });
        } else if (direction == "reverse") {
            this.CallHook("pagewaveStartReverseTransition", { style: aStyle, pagewave: this });
        }

        await aStyle.handle(direction, mainElement);

        if (direction == "normal") {
            this.CallHook("pagewaveEndForwardTransition", { style: aStyle, pagewave: this });
        } else if (direction == "reverse") {
            this.CallHook("pagewaveEndReverseTransition", { style: aStyle, pagewave: this });
        }
    }
}
