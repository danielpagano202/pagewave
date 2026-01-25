import type { DirectionType } from "../types/DirectionType.ts";
import type { OptionsType } from "../types/OptionsType.ts";
import type { TransitionStyle } from "../types/TransitionStyleInterface.ts";

export class PageWave{
    public defaultOptions: OptionsType;
    public finalOptions: OptionsType;
    public routeTransitions: Record<string, TransitionStyle>
    constructor(transitions: Record<string, TransitionStyle>, options = {}){
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
        }
        this.finalOptions = { ...this.defaultOptions, ...options };
        this.routeTransitions = transitions;
    }


    private CallHook(hookName: string, details: Record<string, unknown> = {}) {
        const event = new CustomEvent(hookName, {
            detail: details
        });
        window.dispatchEvent(event);
    }

    private isNavigationFromSameSite() {
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

    private HandleClickAnimation(e: MouseEvent, defaultTransitionStyle: TransitionStyle, leaveFunction = (link: string) => {window.location.href = link;}, externalLeaveFunction = (link: string) => {window.location.href = link;}) {
        if(!e.target || !(e.target instanceof HTMLAnchorElement)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        
        if (e.target.tagName.toLowerCase() == "a") {
            const correctLeaveFunction = this.isInternalLink(e.target.href) ? leaveFunction : externalLeaveFunction;
            const matchedRoute = Array.from(e.target.classList).find(cls => cls in this.routeTransitions);
            const shouldIgnore = (this.finalOptions.preferIgnore && !matchedRoute) || e.target.classList.contains(this.finalOptions.classToIgnoreLink)
            if(!shouldIgnore && (e.target.href != window.location.href || this.finalOptions.animateSelfLink)){
                e.preventDefault();
                let duration = defaultTransitionStyle.duration;
                this.CallHook("animateSSP", { style: defaultTransitionStyle, clickEvent: e });
                if (matchedRoute && matchedRoute in this.routeTransitions) {
                    this.SaveAndTransition(matchedRoute, this.routeTransitions[matchedRoute]!);
                    duration = this.routeTransitions[matchedRoute]!.duration;
                } else {
                    this.SaveAndTransition("animation", defaultTransitionStyle);
                    duration = defaultTransitionStyle.duration;
                }
                setTimeout(
                    () => {
                        this.CallHook("animateESP", { style: defaultTransitionStyle, clickEvent: e });
                        if (this.finalOptions.leavePageOnLink) {
                            correctLeaveFunction((e.target as HTMLAnchorElement).href);
                        }
                    }, duration
                );
            }
            else if (e.target.classList.contains(this.finalOptions.classToIgnoreLink) || (e.target.href == window.location.href && !this.finalOptions.animateSelfLink)) {
                sessionStorage.setItem("animationType", "ignore");
                if (this.finalOptions.leavePageOnLink) {
                    correctLeaveFunction((e.target as HTMLAnchorElement).href);
                }
            }
        } 

    }

    public ListenForChange(defaultTransitionStyle: TransitionStyle, leaveFunction: (link: string) => void = (link) => {window.location.href = link;}) {
        this.EndPoint(defaultTransitionStyle);
        this.SendPoint(defaultTransitionStyle, leaveFunction);
    }

    public SendPoint(defaultTransitionStyle: TransitionStyle, leaveFunction = (link: string) => {window.location.href = link;}, externalLeaveFunction = (link: string) => {window.location.href = link;}) {
        const mainElement = document.getElementById(this.finalOptions.mainContentIdName)!;
        mainElement.onclick = null;
        mainElement.addEventListener("click", (e) => {this.HandleClickAnimation(e, defaultTransitionStyle, leaveFunction, externalLeaveFunction)});

    }

    public getStorageRouteTransition(defaultTransitionStyle: TransitionStyle): TransitionStyle {
        const storageKey = sessionStorage.getItem("animationType")
        if (storageKey != null && storageKey != "animation" && storageKey in this.routeTransitions) {
            return this.routeTransitions[storageKey]!;
        }
        return defaultTransitionStyle;   
    }

    public EndPoint(defaultTransitionStyle: TransitionStyle) {
        defaultTransitionStyle = this.getStorageRouteTransition(defaultTransitionStyle);
        defaultTransitionStyle.hidePage(this.finalOptions);
        const mainElement = document.getElementById(this.finalOptions.mainContentIdName)!;
        mainElement.addEventListener(this.finalOptions.loadEvent, (e) => {
            e.stopPropagation();
            this.CallHook("animateSEP", { style: defaultTransitionStyle });
            const doTransitionOnIgnoredLink = (this.finalOptions.animateIgnoredLinks || sessionStorage.getItem("animationType") != "ignore");
            const doAnimateOnReload = (window.performance.getEntriesByType("navigation")[0]?.entryType != "reload" || this.finalOptions.runAnimationOnPageReload);
            const doAnimateOnSameSite = this.isNavigationFromSameSite() || this.finalOptions.runAnimationOnCrossSite;
            if (doAnimateOnReload && doAnimateOnSameSite && doTransitionOnIgnoredLink) {
                setTimeout(
                    () => {
                        this.AnimatePageTransition(defaultTransitionStyle, "reverse");
                        setTimeout(
                            () => {
                                this.CallHook("animateEEP", { style: defaultTransitionStyle });
                                defaultTransitionStyle.revealPage(this.finalOptions);
                            }, this.finalOptions.pageRevealDelay
                        );
                    }, this.finalOptions.pageAnimationDelay
                );
            } else {
                this.CallHook("animateEPNA", { style: defaultTransitionStyle })
                defaultTransitionStyle.revealPage(this.finalOptions);
            }
        }, { once: true });
    }

    public CallEndPoint(){
        const dispatchEvent = new Event(this.finalOptions.loadEvent);
        document.getElementById(this.finalOptions.mainContentIdName)!.dispatchEvent(dispatchEvent);
    }

    public SaveAndTransition(animationName: string, aStyle: TransitionStyle, direction: DirectionType = "normal") {
        this.AnimatePageTransition(aStyle, "normal");
        sessionStorage.setItem("animationType", animationName);
    }

    public AnimatePageTransition(aStyle: TransitionStyle, direction: DirectionType = "normal") {
        const mainElement = document.getElementById(this.finalOptions.mainContentIdName)!;

        if (direction == "normal") {
            this.CallHook("animateSF", { style: aStyle, ele: mainElement, });
        } else if (direction == "reverse") {
            this.CallHook("animateSR", { style: aStyle, ele: mainElement, });
        }

        aStyle.handle(direction, mainElement);

        setTimeout(
            () => {
                if (direction == "normal") {
                    this.CallHook("animateEF", { style: aStyle, ele: mainElement, });
                } else if (direction == "reverse") {
                    this.CallHook("animateER", { style: aStyle, ele: mainElement, });
                }
            }, aStyle.duration
        );

    }
}