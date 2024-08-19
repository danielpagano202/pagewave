let defaultOptions = {
    mainContentIdName: "main-content",
    overlayClass: "a-overlay",
    animationClass: "a-animation",
    pageAnimationDelay: 200,
    useServiceWorker: true,
    runAnimationOnPageReload: false,
    runAnimationOnCrossSite: false,
    pageRevealDelay: 0,
    leavePageOnLink: true,
    pageBlockerId: "pageBlocker",
    classToIgnoreLink: "ignore-click",
    animateIgnoredLinks: false,
    animateSelfLink: true,
    loadEvent: "DOMContentLoaded",
}
let finalOptions = {
    mainContentIdName: "main-content",
    overlayClass: "a-overlay",
    animationClass: "a-animation",
    pageAnimationDelay: 200,
    useServiceWorker: true,
    runAnimationOnPageReload: false,
    runAnimationOnCrossSite: false,
    pageRevealDelay: 0,
    leavePageOnClick: true,
    pageBlockerId: "pageBlocker",
    classToIgnoreLink: "ignore-click",
    animateIgnoredLinks: false,
    animateSelfLink: true,
    loadEvent: "DOMContentLoaded",
}

export function SetUp(options = {}) {
    //Merge default options with user options
    finalOptions = { ...defaultOptions, ...options };
    //Import css files into HTNL document
    let cssFiles = ["OverlayPreset.css", "KeyFramePreset.css"];
    for (let i = 0; i < cssFiles.length; i++) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssFiles[i];
        document.getElementsByTagName('HEAD')[0].appendChild(link);
    }
}

export const overlayType = Object.freeze({
    slide: Symbol("slide"),
    inverseSlide: Symbol("inverseSlide"),
    curtain: Symbol("curtain"),
    rise: Symbol("rise"),
    fall: Symbol("fall"),
    bubble: Symbol("bubble"),
});
export const keyframeType = Object.freeze({
    fade: Symbol("fade"),
    fadeaway: Symbol("fadeaway"),
});

function ApplyAnimation(element, animationName, duration, timing, direction) {
    element.style.animation = `${animationName} ${duration}ms ${timing} both ${direction}`;
    if (direction == "reverse") {
        let currentAnimation = null;
        element.getAnimations().forEach((animation) => {
            if (currentAnimation == null && animation.animationName == animationName) {
                currentAnimation = animation;
            }
        });
        function handleAnimation(event) {
            if (event.animationName == animationName) {
                let animationKeyframes = currentAnimation.effect;
                let kfValues = Object.values(animationKeyframes.getKeyframes()[0]);
                let kfKeys = Object.keys(animationKeyframes.getKeyframes()[0]);
                let animationProperties = kfValues.slice(3, kfValues.length - 1);
                let animationKeys = kfKeys.slice(3, kfValues.length - 1);
                for (let i = 0; i < animationKeys.length; i++) {
                    element.style[animationKeys[i]] = animationProperties[i].toString();
                }
                element.style.animation = "";
                element.removeEventListener("animationend", handleAnimation);
            }
        }
        element.addEventListener("animationend", handleAnimation,);
    }
}
function CallHook(hookName, details) {
    const event = new CustomEvent(hookName, {
        detail: details
    });
    window.dispatchEvent(event);
}

class KeyFramePreset {
    constructor(kfType, duration, timing = "linear") {
        this.kfType = kfType;
        this.duration = duration;
        this.timing = timing;
    }
    handle(direction) {
        const animationMap = {
            fade: "fade",
            fadeaway: "fadeaway"
        };
        if (animationMap[this.kfType.description]) {
            AnimatePageTransition(new KeyFrameCustom(animationMap[this.kfType.description], this.duration, this.timing), direction);
        }
    }
}

class KeyFrameCustom {
    constructor(animationName, duration, timing = "linear") {
        this.animationName = animationName;
        this.duration = duration;
        this.timing = timing;
    }
    handle(direction, mainElement) {
        mainElement.hidden = false;
        ApplyAnimation(mainElement, this.animationName, this.duration, this.timing, direction)
    }
}

class StyleTransition {
    constructor(styleString, duration, startValue, endValue, timing = "linear") {
        this.styleString = styleString;
        this.duration = duration;
        this.startValue = startValue
        this.endValue = endValue;
        this.timing = timing;
    }
    handle(direction, mainElement) {
        if (direction == "normal") {
            mainElement.style[this.styleString] = this.startValue;
            mainElement.style.transition = this.styleString + " " + this.duration.toString() + "ms " + this.timing;
            mainElement.style[this.styleString] = this.endValue;
        } else if (direction == "reverse") {
            mainElement.style[this.styleString] = this.endValue;
            mainElement.style.transition = this.styleString + " " + this.duration.toString() + "ms " + this.timing;
            setTimeout(
                () => {
                    mainElement.style[this.styleString] = this.startValue;
                }, 40
            );

        }
    }
}

class MultiElementAnimation {
    constructor(animateableObjects, duration, timing = "linear", mainElementAnimation = "") {
        this.animateableObjects = animateableObjects;
        this.duration = duration;
        this.timing = timing;
        this.mainElementAnimation = mainElementAnimation;
    }
    handle(direction, mainElement) {
        mainElement.hidden = false;
        let timing = this.timing;
        for (const [selector, animationName] of Object.entries(this.animateableObjects)) {
            document.querySelectorAll(selector).forEach(element => ApplyAnimation(element, animationName, this.duration, timing, direction));
        }
        if (this.mainElementAnimation != "") {
            ApplyAnimation(mainElement, this.mainElementAnimation, this.duration, timing, direction);
        }
    }
}

class OverlayPreset {
    constructor(oType, duration, color, timing = "linear") {
        this.duration = duration;
        this.color = color;
        this.oType = oType;
        this.timing = timing;
    }
    handle(direction) {
        const overlayMap = {
            slide: { firstOverlayElement: "slide" },
            inverseSlide: { firstOverlayElement: "inverseSlide" },
            curtain: { firstOverlayElement: "rightcurtain", secondOverlayElement: "leftcurtain" },
            rise: { firstOverlayElement: "rise" },
            fall: { firstOverlayElement: "fall" },
            bubble: { firstOverlayElement: "bubble" }
        };
        if (overlayMap[this.oType.description]) {
            AnimatePageTransition(new OverlayCustom(overlayMap[this.oType.description], this.duration, this.color, this.timing), direction);
        }
    }
}

class OverlayCustom {
    constructor(divAnimationObject, duration, color, timing = "linear", mainElementAnimation = "") {
        this.divAnimationObject = divAnimationObject;
        this.duration = duration;
        this.color = color;
        this.timing = timing;
        this.mainElementAnimation = mainElementAnimation;
    }
    handle(direction, mainElement) {
        var r = document.querySelector(':root');
        r.style.setProperty('--div-color', this.color);
        let timing = this.timing;
        /*
        function RemoveDiv(event) {
            if (event.target.animateName == event.animationName) {
                event.target.removeEventListener("animationend", RemoveDiv);
                event.target.remove();
            }
        }*/
        for (const [className, animationName] of Object.entries(this.divAnimationObject)) {
            let divElement = document.createElement("div");
            divElement.className = className;
            divElement.style.animation = `${animationName} ${this.duration.toString()}ms ${timing} both ${direction}`;
            mainElement.appendChild(divElement);
            //divElement.animateName = animationName;
            //divElement.addEventListener("animationend", RemoveDiv);
        }
        if (this.mainElementAnimation != "") {
            mainElement.style.animation = `${this.mainElementAnimation} ${this.duration.toString()}ms ${timing} both ${direction}`;
        }
    }
}

/*
function AddFileToCache(file) {
    if ("serviceWorker" in navigator) {
        if (navigator.serviceWorker.controller) {
            if (navigator.serviceWorker.controller.scriptURL.slice(-5) == "sw.js") {
                navigator.serviceWorker.controller.postMessage(file);
            }
        }
    }
}*/

function AddServiceWorker() {
    if (!finalOptions.useServiceWorker) {
        return true;
    }
    let isServiceWorker = false;
    if ("serviceWorker" in navigator) {
        if (navigator.serviceWorker.controller) {
            if (navigator.serviceWorker.controller.scriptURL.slice(-5) == "sw.js") {
                isServiceWorker = true;
            }
        }
        navigator.serviceWorker.register("sw.js");
    }
    return isServiceWorker;
}

function isNavigationFromSameSite() {
    const referrer = document.referrer;
    if (referrer == "") {
        return false;
    }
    const currentHost = window.location.hostname;
    const referrerHost = new URL(referrer).hostname;

    return referrerHost === currentHost;
}

export function IsOverlay(transitionStyle) {
    if (transitionStyle instanceof OverlayPreset || transitionStyle instanceof OverlayCustom) {
        return true;
    } else if (transitionStyle instanceof StyleTransition || transitionStyle instanceof KeyFrameCustom || transitionStyle instanceof KeyFramePreset || transitionStyle instanceof MultiElementAnimation) {
        return false;
    }
}

export function WaitForElementLoad(selector, functionToExecute) {
    if(document.querySelector(selector) != null){
        functionToExecute(document.querySelector(selector));
        return;
    }
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.matches && node.matches(selector)) {
                    observer.disconnect(); // Stop observing
                    functionToExecute(node); // Handle the element
                }
            });
        });
    });
    // Start observing the document body for child additions
    observer.observe(document.body, { childList: true, subtree: true });
}

export function ListenForChange(aStyle, aOverlay = aStyle, aAnimation = aStyle, leaveFunction = (link) => {window.location = link;}) {
    EndPoint(aStyle, aOverlay, aAnimation, leaveFunction);
    SendPoint(aStyle, aOverlay, aAnimation);
}

export function SendPoint(aStyle, aOverlay = aStyle, aAnimation = aStyle, leaveFunction = (link) => {window.location = link;}) {
    let allowAnimate = AddServiceWorker();

    function HandleClickAnimation(e) {
        //console.log(e.target.tagName, e.target.classList, e.target.href == window.location.href, finalOptions.animateSelfLink)
        if (e.target.tagName.toLowerCase() == "a" && !(e.target.classList.contains(finalOptions.classToIgnoreLink)) && !(e.target.href == window.location.href && !finalOptions.animateSelfLink)) {
            e.preventDefault();
            let duration = aStyle.duration;
            CallHook("animateSSP", { style: aStyle, overlayStyle: aOverlay, animationStyle: aAnimation, clickEvent: e });
            if (e.target.classList.contains(finalOptions.overlayClass)) {
                AnimatePageTransition(aOverlay, "normal");
                duration = aOverlay.duration;
            } else if (e.target.classList.contains(finalOptions.animationClass)) {
                AnimatePageTransition(aAnimation, "normal");
                duration = aAnimation.duration;
            } else {
                AnimatePageTransition(aStyle, "normal");
                duration = aStyle.duration;
            }
            setTimeout(
                () => {
                    CallHook("animateESP", { style: aStyle, overlayStyle: aOverlay, animationStyle: aAnimation, clickEvent: e });
                    window.removeEventListener("click", HandleClickAnimation);
                    if (finalOptions.leavePageOnClick) {
                        leaveFunction(e.target.href);
                    }
                }, parseInt(duration)
            );
        } else if (e.target.classList.contains(finalOptions.classToIgnoreLink) || (e.target.href == window.location.href && !finalOptions.animateSelfLink)) {
            sessionStorage.setItem("animationType", "ignore");
        }

    }

    function AddListeners() {
        window.addEventListener("click", HandleClickAnimation);
    }
    if (allowAnimate) {
        AddListeners();
    }
    else {
        window.addEventListener(finalOptions.loadEvent, () => {
            AddListeners();
        }, { once: true });
    }
}

export function EndPoint(aStyle, aOverlay = aStyle, aAnimation = aStyle) {
    if (aOverlay != aStyle || aAnimation != aStyle) {
        if (sessionStorage.getItem("animationType") === "true") {
            aStyle = aOverlay;
        } else if (sessionStorage.getItem("animationType") === "false") {
            aStyle = aAnimation;
        }
    }
    function RevealPage(opposite = false) {
        if (Boolean(IsOverlay(aStyle) ^ opposite)) {
            if (document.getElementById(finalOptions.pageBlockerId) == null) {
                WaitForElementLoad(
                    "#" + finalOptions.pageBlockerId, () => {
                        if (document.getElementById(finalOptions.pageBlockerId) != null) {
                            document.getElementById(finalOptions.pageBlockerId).remove();
                        }
                    }
                );
            } else {
                document.getElementById(finalOptions.pageBlockerId).remove();
            }
        }
        else if(Boolean(!IsOverlay(aStyle) ^ opposite)) {
            if (document.getElementById(finalOptions.mainContentIdName) == null) {
                WaitForElementLoad(
                    "#" + finalOptions.mainContentIdName, () => {
                        document.getElementById(finalOptions.mainContentIdName).hidden = false;
                    }
                );
            } else {
                document.getElementById(finalOptions.mainContentIdName).hidden = false;
            }
        }
    }

    let allowAnimate = AddServiceWorker();
    //console.log("allow animating");
    if (IsOverlay(aStyle)) {
        RevealPage(true);
        let pageBlocker = document.createElement('div');
        pageBlocker.id = finalOptions.pageBlockerId;
        pageBlocker.style.cssText = `position: absolute; width: 100%; height: 100%; z-index: 100; top: 0; background-color: ${aStyle.color}`
        document.body.append(pageBlocker);
    } else {
        RevealPage(true);
        if (document.getElementById(finalOptions.mainContentIdName) == null) {
            WaitForElementLoad(
                "#" + finalOptions.mainContentIdName, () => {
                    document.getElementById(finalOptions.mainContentIdName).hidden = true;
                }
            );
        } else {
            document.getElementById(finalOptions.mainContentIdName).hidden = true;
        }
    }
    //console.log(allowAnimate, !(!finalOptions.animateIgnoredLinks && sessionStorage.getItem("animationType") == "ignore"), !(!finalOptions.animateSelfLink && sessionStorage.getItem("animationType") == "ignore"))
    if (allowAnimate && !(!finalOptions.animateIgnoredLinks && sessionStorage.getItem("animationType") == "ignore") && !(!finalOptions.animateSelfLink && sessionStorage.getItem("animationType") == "ignore")) {
        window.addEventListener(finalOptions.loadEvent, (e) => {
            e.stopPropagation();
            CallHook("animateSEP", { style: aStyle });
            //console.log(window.performance.getEntriesByType("navigation")[0].type, isNavigationFromSameSite(), finalOptions.runAnimationOnCrossSite)
            if ((window.performance.getEntriesByType("navigation")[0].type != "reload" || finalOptions.runAnimationOnPageReload) && (isNavigationFromSameSite() || finalOptions.runAnimationOnCrossSite)) {
                setTimeout(
                    () => {
                        AnimatePageTransition(aStyle, "reverse");
                        setTimeout(
                            () => {
                                CallHook("animateEEP", { style: aStyle });
                                RevealPage();
                            }, finalOptions.pageRevealDelay
                        );
                    }, finalOptions.pageAnimationDelay
                );
            } else {
                CallHook("animateEPNA", { style: aStyle })
                RevealPage();
            }
        }, { once: true });
    } else {
        window.addEventListener(finalOptions.loadEvent, () => {
            CallHook("animateEPNSW", { style: aStyle })
            RevealPage();
        }, { once: true });
    }
}

export function AnimatePageTransition(aStyle, direction = "normal") {
    let mainElement = document.getElementById(finalOptions.mainContentIdName);
    if (!(aStyle instanceof OverlayPreset) && !(aStyle instanceof KeyFramePreset)) {
        sessionStorage.setItem("animationType", IsOverlay(aStyle).toString());
        if (direction == "normal") {
            CallHook("animateSF", { style: aStyle, ele: mainElement, });
        } else if (direction == "reverse") {
            CallHook("animateSR", { style: aStyle, ele: mainElement, });
        }
    }
    aStyle.handle(direction, mainElement);
    if (!(aStyle instanceof OverlayPreset) && !(aStyle instanceof KeyFramePreset)) {
        setTimeout(
            () => {
                if (direction == "normal") {
                    CallHook("animateEF", { style: aStyle, ele: mainElement, });
                } else if (direction == "reverse") {
                    CallHook("animateER", { style: aStyle, ele: mainElement, });
                }
            }, aStyle.duration
        );
    }

}
