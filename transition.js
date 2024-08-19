//Default Options
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
    usePresets: true,
    cleanUpDivs: false,
}
//Options object that will contain the actual options used by the program
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
    usePresets: true,
    cleanUpDivs: false,
}

//Sets Up Page Transition Capability. Not necessary if you don't need options or presets
function SetUp(options = {}) {
    //Merge default options with user options
    finalOptions = { ...defaultOptions, ...options };
    //Import css files into HTML document automatically
    if(finalOptions.usePresets){
        let cssFiles = ["OverlayPreset.css", "KeyFramePreset.css"];
        for (let i = 0; i < cssFiles.length; i++) {
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssFiles[i];
            document.getElementsByTagName('HEAD')[0].appendChild(link);
        }
    }
}
exports.SetUp = SetUp;
//Overlay Preset Types to Choose From
const overlayType = Object.freeze({
    slide: Symbol("slide"),
    inverseSlide: Symbol("inverseSlide"),
    curtain: Symbol("curtain"),
    rise: Symbol("rise"),
    fall: Symbol("fall"),
    bubble: Symbol("bubble"),
});
exports.overlayType = overlayType;
//Keyframe Preset Types to Choose From
const keyframeType = Object.freeze({
    fade: Symbol("fade"),
    fadeaway: Symbol("fadeaway"),
});
exports.keyframeType = keyframeType;

//Function to apply animation to element and keep its properties and remove the animation
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
//Dispatch an event for the hooks
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
        //Uses keyframeType to run Keyframe Custom
        if (animationMap[this.kfType.description]) {
            AnimatePageTransition(new KeyFrameCustom(animationMap[this.kfType.description], this.duration, this.timing), direction);
        }
    }
}
exports.KeyFramePreset = KeyFramePreset;
class KeyFrameCustom {
    constructor(animationName, duration, timing = "linear") {
        this.animationName = animationName;
        this.duration = duration;
        this.timing = timing;
    }
    handle(direction, mainElement) {
        //Reveals element and applys the animation
        mainElement.hidden = false;
        ApplyAnimation(mainElement, this.animationName, this.duration, this.timing, direction)
    }
}
exports.KeyFrameCustom = KeyFrameCustom;
class StyleTransition {
    constructor(styleString, duration, startValue, endValue, timing = "linear") {
        this.styleString = styleString;
        this.duration = duration;
        this.startValue = startValue
        this.endValue = endValue;
        this.timing = timing;
    }
    handle(direction, mainElement) {
        //Applys the transition in the right direction
        if (direction == "normal") {
            mainElement.style[this.styleString] = this.startValue;
            mainElement.style.transition = this.styleString + " " + this.duration.toString() + "ms " + this.timing;
            mainElement.style[this.styleString] = this.endValue;
        } else if (direction == "reverse") {
            mainElement.style[this.styleString] = this.endValue;
            mainElement.style.transition = this.styleString + " " + this.duration.toString() + "ms " + this.timing;
            //Timeout is needed for some reason. Need to test further but it works
            setTimeout(
                () => {
                    mainElement.style[this.styleString] = this.startValue;
                }, 40
            );

        }
    }
}
exports.StyleTransition = StyleTransition;
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
        //Goes through every animation selector, finds all of those elements, and applies the proper animation to them
        for (const [selector, animationName] of Object.entries(this.animateableObjects)) {
            document.querySelectorAll(selector).forEach(element => ApplyAnimation(element, animationName, this.duration, timing, direction));
        }
        //Animates main element if animation is given
        if (this.mainElementAnimation != "") {
            ApplyAnimation(mainElement, this.mainElementAnimation, this.duration, timing, direction);
        }
    }
}
exports.MultiElementAnimation = MultiElementAnimation;
class OverlayPreset {
    constructor(oType, duration, color, timing = "linear") {
        this.duration = duration;
        this.color = color;
        this.oType = oType;
        this.timing = timing;
    }
    handle(direction) {
        //Finds the proper preset and runs OverlayCustom appropriately
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
exports.OverlayPreset = OverlayPreset;
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
        //Removes divs when animation is finished
        function RemoveDiv(event) {
            if (event.target.animateName == event.animationName) {
                event.target.removeEventListener("animationend", RemoveDiv);
                event.target.remove();
            }
        }
        //Loops through divs, creating them, adding the provided class, and giving them an animation
        for (const [className, animationName] of Object.entries(this.divAnimationObject)) {
            let divElement = document.createElement("div");
            divElement.className = className;
            divElement.style.animation = `${animationName} ${this.duration.toString()}ms ${timing} both ${direction}`;
            mainElement.appendChild(divElement);
            //Removes divs at end of animation
            if(finalOptions.cleanUpDivs){
                divElement.animateName = animationName;
                divElement.addEventListener("animationend", RemoveDiv);
            }
        }
        //Animates main element if animation is given
        if (this.mainElementAnimation != "") {
            mainElement.style.animation = `${this.mainElementAnimation} ${this.duration.toString()}ms ${timing} both ${direction}`;
        }
    }
}
exports.OverlayCustom = OverlayCustom;
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
//Adds service worker to cache presets and this script. Returns a boolean true if it is already active or useServiceWorker was overrided; false otherwise
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
//Checks if navigation is from same site. Returns false if referrer and current host are different of refferer is empty
function isNavigationFromSameSite() {
    const referrer = document.referrer;
    if (referrer == "") {
        return false;
    }
    const currentHost = window.location.hostname;
    const referrerHost = new URL(referrer).hostname;

    return referrerHost === currentHost;
}
//Returns true if animation is overlay type, false if animation type
function IsOverlay(transitionStyle) {
    if (transitionStyle instanceof OverlayPreset || transitionStyle instanceof OverlayCustom) {
        return true;
    } else if (transitionStyle instanceof StyleTransition || transitionStyle instanceof KeyFrameCustom || transitionStyle instanceof KeyFramePreset || transitionStyle instanceof MultiElementAnimation) {
        return false;
    }
}
exports.IsOverlay = IsOverlay;
//Checks if element exists. If it does, it runs functionToExecute. Otherwise, waits until element exists to run the function
function WaitForElementLoad(selector, functionToExecute) {
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
exports.WaitForElementLoad = WaitForElementLoad;
//Shorthand for SendPoint and EndPoint
function ListenForChange(aStyle, aOverlay = aStyle, aAnimation = aStyle, leaveFunction = (link) => {window.location = link;}) {
    EndPoint(aStyle, aOverlay, aAnimation, leaveFunction);
    SendPoint(aStyle, aOverlay, aAnimation);
}
exports.ListenForChange = ListenForChange;
//Listens for clicks and plays animation and then redirects
function SendPoint(aStyle, aOverlay = aStyle, aAnimation = aStyle, leaveFunction = (link) => {window.location = link;}) {
    //True if service worker is active or ignored with useServiceWorker=false, false otherwise
    let allowAnimate = AddServiceWorker();

    function HandleClickAnimation(e) {
        //Checks to see if target is a link, it is not a link to ignore, not a self link + animateSelfLink=false
        if (e.target.tagName == "A" && !(e.target.classList.contains(finalOptions.classToIgnoreLink)) && !(e.target.href == window.location.href && !finalOptions.animateSelfLink)) {
            //Prevents link from redirecting
            e.preventDefault();
            let duration = aStyle.duration;
            CallHook("animateSSP", { style: aStyle, overlayStyle: aOverlay, animationStyle: aAnimation, clickEvent: e });
            //Plays the right animation depending on link type and sets proper duration
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
            //Calls the leave function when duration timer finishes
            setTimeout(
                () => {
                    CallHook("animateESP", { style: aStyle, overlayStyle: aOverlay, animationStyle: aAnimation, clickEvent: e });
                    window.removeEventListener("click", HandleClickAnimation);
                    if (finalOptions.leavePageOnClick) {
                        leaveFunction(e.target.href);
                    }
                }, parseInt(duration)
            );
        //We set the storage to ignore so we don't play an animation when we go to another page.
        } else if (e.target.classList.contains(finalOptions.classToIgnoreLink) || (e.target.href == window.location.href && !finalOptions.animateSelfLink)) {
            sessionStorage.setItem("animationType", "ignore");
        }

    }

    function AddListeners() {
        window.addEventListener("click", HandleClickAnimation);
    }
    //If service worker active, can immediately listen
    if (allowAnimate) {
        AddListeners();
    }
    //Else, wait until the loadEvent provided is triggered
    else {
        window.addEventListener(finalOptions.loadEvent, () => {
            AddListeners();
        }, { once: true });
    }
}
exports.SendPoint = SendPoint;
//Waits for the document to load and plays the reverse animation
function EndPoint(aStyle, aOverlay = aStyle, aAnimation = aStyle) {
    //Checks to see what kind of receiving animation to play
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
    //True if service worker is active or ignored with useServiceWorker=false, false otherwise
    let allowAnimate = AddServiceWorker();
    //Figures out what kind of animation it is and hides the document properly
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
    //Checks to see if allowAnimate=true and we aren't supposed to be ignoring the link
    if (allowAnimate && !(sessionStorage.getItem("animationType") === "ignore" && (finalOptions.animateIgnoredLinks || finalOptions.animateSelfLink))){        
        //Once the load evnet is triggered, it registers a listener
        window.addEventListener(finalOptions.loadEvent, (e) => {
            e.stopPropagation();
            CallHook("animateSEP", { style: aStyle });
            //If we reloaded, we want to make sure runAnimationOnPageReload is false and if we came from a different site, we want to make sure we can run animation on cross site
            if ((window.performance.getEntriesByType("navigation")[0].type != "reload" || finalOptions.runAnimationOnPageReload) && (isNavigationFromSameSite() || finalOptions.runAnimationOnCrossSite)) {
                //Uses a delay between this to keep the document hidden for extra if the load event isn't trusted
                setTimeout(
                    () => {
                        AnimatePageTransition(aStyle, "reverse");
                        //Delay between animation and reveal
                        setTimeout(
                            () => {
                                CallHook("animateEEP", { style: aStyle });
                                RevealPage();
                            }, finalOptions.pageRevealDelay
                        );
                    }, finalOptions.pageAnimationDelay
                );
            } else {
                //Reveals page after document is built
                CallHook("animateEPNA", { style: aStyle })
                RevealPage();
            }
        }, { once: true });
    } else {
        //Waits for load and Reveals the Page
        window.addEventListener(finalOptions.loadEvent, () => {
            CallHook("animateEPNSW", { style: aStyle })
            RevealPage();
        }, { once: true });
    }
}
exports.EndPoint = EndPoint;
//Animates the page transition
function AnimatePageTransition(aStyle, direction = "normal") {
    let mainElement = document.getElementById(finalOptions.mainContentIdName);
    //If we don't have a preset, we can call a hook because presets also call their custom variant
    if (!(aStyle instanceof OverlayPreset) && !(aStyle instanceof KeyFramePreset)) {
        //Sets animationType in storage to allow EndPoint to change page transition element depending on type
        sessionStorage.setItem("animationType", IsOverlay(aStyle).toString());
        if (direction == "normal") {
            CallHook("animateSF", { style: aStyle, ele: mainElement, });
        } else if (direction == "reverse") {
            CallHook("animateSR", { style: aStyle, ele: mainElement, });
        }
    }
    //Calls handle function of style element
    aStyle.handle(direction, mainElement);
    //Same logic as above except for end hooks
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
exports.AnimatePageTransition = AnimatePageTransition;