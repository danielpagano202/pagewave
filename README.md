
# PageWave

An NPM Package for implementing page transitions in both SSR and CSR apps




## Installation

Downloading the project files from Github (Recommended to allow for service worker to cache pages effectively)

Install my-project with npm

```bash
npm install pagewave
```

If gotten from NPM, service worker doesn't get added, so the optional parameter useServiceWorker needs to be false and pages should be cached for optimal transitions.
    
## Features

- Built-in animations
- Hooks
- Doesn't touch history or use push state, allowing for you to use it with routers like sveltekit
- Manual page transition animations can be run to avoid conflicts with any frameworks
- Customizable ids for divs to avoid conflict with elements in your body
- Allows for custom overlay animations, keyframe animations, or transition animations
- Separate listener animations for different types of animations
- Separate types of links for overlay or other animations


## High Level Explanation

This package involves two types of animations: Overlay and Keyframe.
- Overlay involve colored divs that move on the screen i.e. screen wipe
- Keyframe involve animations of existing animations i.e. fading away

These two animations can be created through certain classes
```javascript
Style Transition 
//Utilizes CSS transition to affect a certain value
StyleTransition("opacity", 500, "1", "0")

KeyFramePreset
//Utilizes one of the packages presets to animate
KeyFramePreset(keyframeType.fade, 250, "ease-in-out");

KeyFrameCustom
//Utilizes a custom animation
KeyFrameCustom("move", 250, "ease-in-out");

OverlayPreset
//Utilizes one of the packages presets to animate Div overlay
OverlayPreset(overlayType.bubble, 500, "#293241");

OverlayCustom
//Creates a custom animation of div(s)
OverlayCustom(
    {
        "first": "rise",
        "second": "fall",
        "third": "slide",
        "fourth": "inverseSlide",
    }, 3000, "#293241", "ease-in-out"
);

MultiElementAnimation
//Animates many elements independently in the transition
MultiElementAnimation(
    {
        "h1": "move",
        "p": "move",
        ".other-header": "inverseMove",
    }, 1000, "linear", "fadeAll"
)
```

These styles of transition can be used in link clicks, page loads, and manually very easily through functions calls.

## Getting started

```javascript
    //Optional parameter can be ignored if not downloaded from npm
    SetUp({useServiceWorker: false});
```

### Setting up an animation

Tag the element that encapsulates the content with an id of 'main-content'

If you can't do that, change the parameter name.

```html
<script>
    //Optional parameter can be ignored if not downloaded from npm
    SetUp({useServiceWorker: false});

    //Creates a style with preset bubble transition
    //Length of 500ms and color of "#293241"
    let aSty = new OverlayPreset(
        overlayType.bubble, 500, "#293241"
    );

    //Makes links use transition and plays transition on page enter
    ListenForChange(aSty);

    //Alternatively, split it up if you want different animations for each

    //Makes links use the transitions when going to page
    SendPoint(aSty);

    //Makes transition appear when arriving to this page
    EndPoint(aSty);

</script>

<div id="main-content">
    <p>Content!</p>
    ...
</div>
    

```

## Working with SSR

Many of these features work flawlessly with CSR. 

However, small changes need to be made depending on what SSR you are using.

I tested this with Svelte as that is what I am familiar with.

#### Changes

- runAnimationOnPageReload needs to be set to true, because hydrating the page only counts as a reload, not a page change
- loadEvent needs to be run independently. I would change it to "load" and call the event separately using dispatch event
- SetUp may not automatically import the preset CSS files, so it may need to be done manually

## Other Cool Features

### Custom Keyframe Transitions

This will create an animation style, that when called:

Moves h1 and p elements to the left

Moves h2 and elements with 'moving' class to the right

This is over 1000ms, at a 'linear' pace, and fades everything

Essentially you can specify specific transitions for certain classes and a global transition for everything


```html
<script>
    SetUp();
    
    let anim = new MultiElementAnimation(
        {
            "h1": "move",
            "p": "move",
            "h2": "inverseMove",
            ".moving": "inverseMove",
        }, 1000, "linear", "fadeAll"
    );
    
    ListenForChange(anim);
</script>

<div id="main-content">
    <h1>Header</h1>
    <p>Paragraph</p>
    <h2>Second Header</h2>
    <span class="moving"> Moving! </span>
</div>

<style>
    @keyframes move {
        from{
            transform: translate(0px, 0px);
            color: black;
            opacity: 1;
        }
        to{
            transform: translate(-200px, 0px);
            opacity: 0;
            color: white;
        }
        
    }
    @keyframes inverseMove {
        from{
            transform: translate(0, 0px);
            opacity: 1;
        }
        to{
            transform: translate(200px, 0px);
            opacity: 0;
        }
        
    }
    @keyframes fadeAll {
        from{
            opacity: 1;
        }
        to{
            opacity: 0;
        }
    }
</style>

```

### Custom Overlay Transitions

The same thing can be done with overlays

This will run these transitions and the overlays will have the class names of 'first', 'second', etc.

Run for 3000ms, with a color of #293241 and pace of 'ease-in-out'

```javascript
let aStyle = new OverlayCustom(
    {
        "first": "rise",
        "second": "fall",
        "third": "slide",
        "fourth": "inverseSlide",
    }, 3000, "#293241", "ease-in-out"
);

//Names are presets transitions, so check OverlayPreset.css to see the CSS

```

#### Manual Transitions

You can do transitions manually through the ```AnimatePageTransition(style)``` function which takes an animation style as a parameter

### Different Transitions

You can have three different animations you can call in the ```SendPoint(), EndPoint(), or ListenForChange()``` function.

For example:
```
let defaultAnimation = ...
let overlayAnimation = ...
let keyframeAnimation = ...
SendPoint(defaultAnimation, overlayAnimation, keyframeAnimation);
```

You can specify which animation is called by adding classes to link.
- a-overlay for overlayAnimation
- a-animation for keyframeAnimation


### Custom Link function

By default, this package uses a default function of ```window.location = link;``` for changing links. However, this can be customized in either ```SendPoint() or ListenForChange()```

```
let defaultAnimation = ...
let overlayAnimation = ...
let keyframeAnimation = ...
let linkFunction = (link) => {
    console.log(link);
    window.location = link;
}
SendPoint(defaultAnimation, overlayAnimation, keyframeAnimation, linkFunction);
```

This is useful in SSR when the link change function is different from the default one.

### Events

There are many events that can be listened to to call certain code.

- animateSF - animation start, forward direction
- animateSR - animation start, reverse direction
- animateEF - animation end, forward direction
- animateER - animation end, reverse direction
- animateSSP - start of Send Point listening (when a link is clicked)
- animateESP - end of Send Point listen (when the animation is handled)
- animateSEP - start of end point listen (when the load event is dispatched)
- animateEPNSW - end point no service worker exists (when there is no service worker and service workers are being used)
- animateEEP - end of end point (when the page is revealed after an animation)
- animateEPNA - end point no animation played (when the page is revealed but no animation was played)



### This program has optional parameters:

#### Optional Parameter Name : Default Value

```javascript
//This is the class for the content that the transition will affect/cover
mainContentIdName: "main-content"

//This is the class name that a button needs to cause the overlay transitions
overlayClass: "a-overlay",

//This is the class name that a button needs to cause the key frame transition
animationClass: "a-animation",

//This is the delay between the page loading and the page beginning the animation
pageAnimationDelay: 200,

//This is the whether to use a service worker. If using npm, service worker doesn't work, so this needs to be disabled!
useServiceWorker: true,

//Whether the transition should run when the page is reloaded
//Sometimes needs to be enabled in SSR because of how they treat going from one page to another as reloading
runAnimationOnPageReload: false,

//Whether the transition should run when a link goes to a different page
runAnimationOnCrossSite: false,

//The delay between the animation playing and the page revealing
pageRevealDelay: 0,

//Whether the page should be left after animation
leavePageOnLink: true,

//What the ID of the element that blocks the page is
pageBlockerId: "pageBlocker",

//What class should be added to links to not transition
classToIgnoreLink: "ignore-click",

//Whether ignored links should animate
animateIgnoredLinks: false,

//Whether links to the same page should animate
animateSelfLink: true,

//The event that is checked to see that the page is loaded
//Important to change on SSR because this event isn't automatically triggered
loadEvent: "DOMContentLoaded",
```

## Supporting

If you find this project helpful, considering starring it. I would greatly appreciate it! :)
