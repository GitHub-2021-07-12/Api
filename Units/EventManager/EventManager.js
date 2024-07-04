// 31.03.2024


export class EventManager extends EventTarget {
    static event__dispatch(eventTarget, event_name, event_detail = null) {
        let event_opts = {
            cancelable: true,
            detail: event_detail,
        };
        let event = new CustomEvent(event_name, event_opts);

        return eventTarget.dispatchEvent(event);
    }

    static event_async__dispatch(eventTarget, event_name, event_detail = null) {
        setTimeout(() => this.event__dispatch(eventTarget, event_name, event_detail));
    }

    static eventListeners__add(eventTarget, eventListeners) {
        return this.eventListeners__apply(eventTarget, eventListeners);
    }

    static eventListeners__apply(eventTarget, eventListeners, add = true) {
        let method = add ? 'addEventListener' : 'removeEventListener';

        for (let [event_name, eventListener] of Object.entries(eventListeners)) {
            if (!(eventListener instanceof Array)) {
                eventListener = [eventListener];
            }

            eventTarget[method](event_name, ...eventListener);
        }
    }

    static eventListeners__proc(context, eventListeners, binding = false) {
        let eventListeners_processed = {};

        for (let [key, value] of Object.entries(eventListeners)) {
            if (value.constructor == Object) {
                value = this.eventListeners__proc(context, value, binding);
            }
            else {
                let eventListener = value instanceof Array ? [...value] : [value];

                if (typeof eventListener[0] == 'string') {
                    eventListener[0] = context[eventListener[0]];
                }

                if (binding) {
                    eventListener[0] = eventListener[0].bind(context);
                }

                value = eventListener;
            }

            eventListeners_processed[key] = value;
        }

        return eventListeners_processed;
    }

    static eventListeners_grouped__apply(eventTargets, eventListeners_grouped, add = true) {
        for (let [eventTarget_name, eventTarget] of Object.entries(eventTargets)) {
            let eventListeners = eventListeners_grouped[eventTarget_name];

            if (!eventListeners) continue;

            this.eventListeners__apply(eventTarget, eventListeners, add);
        }
    }

    static eventListeners__remove(eventTarget, eventListeners) {
        return this.eventListeners__apply(eventTarget, eventListeners, false);
    }


    _eventListeners__proc(eventListeners, binding = false) {
        return this.constructor.eventListeners__proc(this, eventListeners, binding);
    }


    event__dispatch(event_name, event_detail = null) {
        return this.constructor.event__dispatch(this, event_name, event_detail);
    }

    event_async__dispatch(event_name, event_detail = null) {
        return this.constructor.event_async__dispatch(this, event_name, event_detail);
    }

    eventListeners__add(eventListeners) {
        return this.eventListeners__apply(eventListeners);
    }

    eventListeners__apply(eventListeners, add = true) {
        return this.constructor.eventListeners__apply(this, eventListeners, add);
    }

    eventListeners__remove(eventListeners) {
        return this.eventListeners__apply(eventListeners, false);
    }
}
