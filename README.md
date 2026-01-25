
# PageWave

An NPM Package for implementing page transitions in both SSR and CSR apps


## Installation

Install pagewave with npm

```bash
npm install pagewave
```

    
## Features

- Built-in animations
- Hooks
- Doesn't touch history or use push state, allowing for you to use it with routers like sveltekit
- Manual page transition animations can be run to avoid conflicts with any frameworks
- Customizable ids for divs to avoid conflict with elements in your body
- Allows for custom animations based on class name of link
- Preset transition classes to get up and running quickly
- Highly customizable transition options
- Extendable class system to create custom transition styles


## High Level Explanation

This package involves allows a user to set up certain routes with names and have those routes triggered either by clicking on a link, loading onto a page, or manually. 

Utilize transtion classes premade or custom built to handle it.

## Getting started

At its core, 

```typescript
    import { PageWave, KeyFramePreset, StyleTransition, type KeyFrameType } from 'pagewave';
    import "pagewave/KeyFramePreset.css";

    let keyFrameType: KeyFrameType = "fadetoright";

    let fadeToRightTransition = new KeyFrameCustom(
        keyFrameType, 250, "ease-in-out"
    );

    let defaultTransition = new StyleTransition(
        "opacity", 250, "1", "0"
    );

    const pw: PageWave = new PageWave(
        {
            "fade": fadeToRightTransition
        },
    );
    
    // The following code should be contained within a client function like Sveltekit onMount or React useLayoutEffect if being done in SSR

    // Setups the transition to occur when loading onto page, with a default transition provided
    pw.EndPoint(defaultTransition);

    // Setups the transition to occur when a link is clicked, with a default transition provided
	pw.SendPoint(defaultTransition);

    // Called to start the endpoint
	pw.CallEndPoint();
```

In this code, there are a few points to note:
- The arguments in PageWave represent routes that are used by EndPoint and SendPoint
- For SendPoint, if a link has the class "fade", it will run the fade animation when clicked, and then go to the link. It will also save in sessionStorage the name "fade" under animationType
- This session storage is used in EndPoint as it looks for a route matching the saved value under animationType. In this code, it would look for fade and play that transition.
- Just because two pages may have "fade" defined doesn't mean that they have to play the same animation
- CallEndPoint is utilized in cases where the base event "DOMContentLoaded" isn't called on every page (like in SSR where the layout stays constant)

### Setting up an animation

Tag the element that encapsulates the content with an id of 'main-content'

If you can't do that, change the parameter name.

```html
<script>
    import { PageWave, KeyFramePreset, StyleTransition, type KeyFrameType } from 'pagewave'
    import "pagewave/OverlayPreset.css";
    let keyFrameType: OverlayType = "bubble";

    let bubbleTransition = new OverlayPreset(
        overlayType.bubble, 500, "#293241"
    );

    let defaultTransition = new StyleTransition(
        "opacity", 250, "1", "0"
    );

    const pw: PageWave = new PageWave(
        {
            "pagewave-bubble": bubbleTransition
        },
        {
            // These are options. This option is unnecessary as it defaults to "main-content", but showcasing you can change it
            mainContentIdName: "main-content"
        }
    );
    
    // The following code should be contained within a client function like Sveltekit onMount or React useLayoutEffect if being done in SSR
    
    // Combines Endpoint and Sendpoint if you need individual control
    pw.ListenForChange(defaultTransition);
    pw.CallEndPoint();

</script>

<!--The area that you want to transition must be marked with id="main-content"-->
<div id="main-content">
    <h1>This is my page</h1>
    <!-- This link transitions with the pagewave-bubble transition-->
    <a href="..." class="pagewave-bubble">Click me to transition!</a>
</div>

```

## Working with SSR

Because of the nature of SSR, a few changes have to be made:
- The Send and End Points function must be run in load functions as they make reference to the window for changing the link and dispatching events
- You need to change the goto Function for SendPoint. Do this by `SendPoint(defaultTransition, () => {/* Function */})`
- Links may need to prevent default. The SendPoint function does this automatically, but it may need to be done manually

## Other Cool Features

### Custom Keyframe Transitions

This will create an animation style, that when called:

Moves h1 and p elements to the left

Moves h2 and elements with 'moving' class to the right

This is over 1000ms, at a 'linear' pace, and fades everything

Essentially you can specify specific transitions for certain classes and a global transition for everything


```javascript
...

let multiElementAnimation =l new MultiElementAnimation(
    {
        "h1": "move",
        "p": "move",
        "h2": "inverseMove",
        ".moving": "inverseMove",
    }, 1000, "linear", "fadeAll"
);

pw.ListenForChange(multiElementAnimation);

...

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

...

```

### Custom Overlay Transitions

There are a few kinds of Custom Overlays

OverlayCustom allows you to define which many different overlays and customize them. They will take the key as the class name (if you want to find it) and the value as the animation.

After the object of divs, there is
- duration
- color of divs
- timing
- animation to play while Overlay Animation plays

OverlayStyled is similar, except for two parts:
- The object is now multi level, where the key is still the class name, but the value is object consisting of the animation name and the styles to be applied to the specific div.
- After all the parameters, there is a new parameter that allows you to change the style of the blocker element. This is useful in cases like the example where since the div is a gradient, the blocker should look like that to be seamless

```javascript
let customOverlay = new OverlayCustom(
    {
        "first": "rise",
        "second": "fall",
        "third": "slide",
        "fourth": "inverseSlide",
    }, 3000, "#293241", "ease-in-out", null
);

let styledOverlay = new OverlayStyled(
    {
        "first": {
            animationName: "rise",
            cssDesign: {
                "background": "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)"
            }
        }, 
    }, 3000, "#293241", "ease-in-out", null, {
            "background": "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)"
    }
)

```

#### Manual Transitions

You can do transitions manually through the ```AnimatePageTransition(style)``` method which takes a Transitionstyle as a parameter


### Custom Link function

By default, this package uses a default function of ```window.location = link;``` for changing links. However, this can be customized in either ```SendPoint() or ListenForChange()```

```
let defaultAnimation = ...
let linkFunction = (link) => {
    console.log(link);
    window.location = link;
}
SendPoint(defaultAnimation, linkFunction);
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
- animateEEP - end of end point (when the page is revealed after an animation)
- animateEPNA - end point no animation played (when the page is revealed but no animation was played)

Listen by using window.addEventListener("...", (e) => {

})

### This program has optional parameters:

#### Optional Parameter Name : Default Value

```javascript
//This is the class for the content that the transition will affect/cover
mainContentIdName: "main-content"

//This is the delay between the page loading and the page beginning the animation
pageAnimationDelay: 100,

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

//The event that is checked to see that the page is loaded and what CallEndPoint dispatches
loadEvent: "DOMContentLoaded",

// When true, it will ignore transitioning on a link if no animation is found in the class list
// Otherwise, it will transition every time unless explicitly told to ignore
preferIgnore: false
```

## Extending with Custom Transition classes
PageWave provides many custom classes to create beautiful transitions:
- **KeyFrameCustom** for a custom transition animation on main-content
- **KeyFramePreset** to utilize premade animations for getting started quickly
- **MultiElementAnimation** to animate multiple elements and have more fine grained control
- **OverlayCustom** for a custom overlay animation
- **OverlayPreset** to utilize premade overlay animations for getting started quickly
- **OverlayStyled** to have complete control over how an overlay animation looks
- **StyleTransition** to utilize the transition css property to animate a single property

However, if you need to do something not listed here, the class system can be easily extended.

To do so, you must implement the TransitionStyleInterface which requires a few parts to be defined:
- duration: number (how long the animation lasts)
- timing: TimingType (how the animation moves)
- handle(direction: DirectionType, mainElement: HTMLElement) : void (runs the actual transition animation)
- hidePage(options: OptionsType) : void (hides the page either before or after animation)
- revealPage(options: OptionsType): void (reveals the page once animation needs to be shown)

PageWave does the rest of the work on using these functions to create seamless transitions.

If you want to use a preexisting implementation, you can use KeyFrameBase or OverlayBase which power many of their respective child classes.

## Supporting

If you find this project helpful, considering starring ⭐ it. I would greatly appreciate it! :)
