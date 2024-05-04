// 31.03.2024


export class EventManager extends EventTarget {
    static _eventListener__proc(eventListener, opts = null) {
        eventListener = eventListener instanceof Array ? eventListener : [eventListener];

        if (opts) {
            eventListener[1] ??= opts;
        }

        return eventListener;
    }


    static event__dispatch(eventTarget, event_name, event_detail = null) {
        return eventTarget.dispatchEvent(new CustomEvent(event_name, {cancelable: true, detail: event_detail}));
    }

    static event__dispatch_async(eventTarget, event_name, event_detail = null) {
        setTimeout(() => this.event__dispatch(eventTarget, event_name, event_detail));
    }

    static eventListeners__add(eventTarget, eventListeners, opts = null) {
        for (let [event_name, eventListener] of Object.entries(eventListeners)) {
            eventTarget.addEventListener(event_name, ...this._eventListener__proc(eventListener, opts));
        }
    }

    static eventListeners__remove(eventTarget, eventListeners, opts = null) {
        for (let [event_name, eventListener] of Object.entries(eventListeners)) {
            eventTarget.removeEventListener(event_name, ...this._eventListener__proc(eventListener, opts));
        }
    }


    event__dispatch(event_name, event_detail = null) {
        return this.constructor.event__dispatch(this, event_name, event_detail);
    }

    event__dispatch_async(event_name, event_detail = null) {
        return this.constructor.event__dispatch_async(this, event_name, event_detail);
    }

    eventListeners__add(eventListeners, opts = null) {
        return this.constructor.eventListeners__add(this, eventListeners, opts);
    }

    eventListeners__remove(eventListeners, opts = null) {
        return this.constructor.eventListeners__remove(this, eventListeners, opts);
    }
}
