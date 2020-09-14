const trigger = new ScrollTrigger({
    // Set custom (default) options for the triggers, these can be overwritten
    // when adding new triggers to the ScrollTrigger instance. If you pass
    // options when adding new triggers, you'll only need to pass the object
    // `trigger`, e.g. { once: false }
    trigger: {
        // If the trigger should just work one time
        once: false,
        offset: {
            // Set an offset based on the elements position, returning an
            // integer = offset in px, float = offset in percentage of either
            // width (when setting the x offset) or height (when setting y)
            //
            // So setting an yOffset of 0.2 means 20% of the elements height,
            // the callback / class will be toggled when the element is 20%
            // in the viewport.
            element: {
                x: 0,
                y: (trigger, rect, direction) => {
                    // You can add custom offsets according to callbacks, you
                    // get passed the trigger, rect (DOMRect) and the scroll
                    // direction, a string of either top, left, right or
                    // bottom.
                    return 0.2
                }
            },
            // Setting an offset of 0.2 on the viewport means the trigger
            // will be called when the element is 20% in the viewport. So if
            // your screen is 1200x600px, the trigger will be called when the
            // user has scrolled for 120px.
            viewport: {
                x: 0,
                y: (trigger, frame, direction) => {
                    // We check if the trigger is visible, if so, the offset
                    // on the viewport is 0, otherwise it's 20% of the height
                    // of the viewport. This causes the triggers to animate
                    // 'on screen' when the element is in the viewport, but
                    // don't trigger the 'out' class until the element is out
                    // of the viewport.

                    // This is the same as returning Math.ceil(0.2 * frame.h)
                    return trigger.visible ? 0 : 0.2
                }
            }
        },
        toggle: {
            // The class(es) that should be toggled
            class: {
                in: 'visible', // Either a string, or an array of strings
                out: ['invisible', 'extraClassToToggleWhenHidden']
            },
            callback: {
                // A callback when the element is going in the viewport, you can
                // return a Promise here, the trigger will not be called until
                // the promise resolves.
                in: null,
                // A callback when the element is visible on screen, keeps
                // on triggering for as long as 'sustain' is set
                visible: null,
                // A callback when the element is going out of the viewport.
                // You can also return a promise here, like in the 'in' callback.
                //
                // Here an example where all triggers take 10ms to trigger
                // the 'out' class.
                out: (trigger) => {
                    // `trigger` contains the Trigger object that goes out
                    // of the viewport
                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 10)
                    })
                }
            }
        },
    },
    // Set custom options and callbacks for the ScrollAnimationLoop
    scroll: {
        // The amount of ms the scroll loop should keep triggering after the
        // scrolling has stopped. This is sometimes nice for canvas
        // animations.
        sustain: 200,
        // Window|HTMLDocument|HTMLElement to check for scroll events
        element: window,
        // Add a callback when the user has scrolled, keeps on triggering for
        // as long as the sustain is set to do
        callback: didScroll,
        // Callback when the user started scrolling
        start: () => {},
        // Callback when the user stopped scrolling
        stop: () => {},
        // Callback when the user changes direction in scrolling
        directionChange: () => {}
    }
})

/***
 ** Methods on the ScrollTrigger instance
 ***/

/**
 * Creates a Trigger object from a given element and optional option set
 * @param {HTMLElement} element
 * @param {DefaultOptions.trigger} [options=DefaultOptions.trigger] options
 * @returns Trigger
 */
trigger.createTrigger(element, options)

/**
 * Creates an array of triggers
 * @param {HTMLElement[]|NodeList} elements
 * @param {Object} [options=null] options
 * @returns {Trigger[]} Array of triggers
 */
trigger.createTriggers(elements, options)

/**
 * Adds triggers
 * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
 * @param {Object} [options=null] options
 * @returns {ScrollTrigger}
 */
trigger.add(objects, options)

/**
 * Removes triggers
 * @param {string|HTMLElement|NodeList|Trigger|Trigger[]} objects A list of objects or a query
 * @returns {ScrollTrigger}
 */
trigger.remove(objects)

/**
 * Lookup one or multiple triggers by a query string
 * @param {string} selector
 * @returns {Trigger[]}
 */
trigger.query(selector)

/**
 * Lookup one or multiple triggers by a certain HTMLElement or NodeList
 * @param {HTMLElement|HTMLElement[]|NodeList} element
 * @returns {Trigger|Trigger[]|null}
 */
trigger.search(element)

/**
 * Reattaches the scroll listener
 */
trigger.listen()

/**
 * Kills the scroll listener
 */
trigger.kill()


/***
 ** Methods on a Trigger instance, e.g. when receiving from a callback or from a query
 ***/
const receivedTrigger = new Trigger()

/**
 * The HTML element
 */
receivedTrigger.element

/**
 * The offset settings
 */
receivedTrigger.offset

/**
 * The toggle settings
 */
receivedTrigger.toggle

/**
 * If the trigger should fire once, boolean
 */
receivedTrigger.once

/**
 * If the trigger is visible, boolean
 */
receivedTrigger.visible
