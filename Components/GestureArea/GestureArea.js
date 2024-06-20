// 12.06.2024


import {Component} from '../Component/Component.js';

import {Vector_2d} from '../../Units/Vector_2d/Vector_2d.js';


export class GestureArea extends Component {
    static _Pointer = class {
        id = 0;
        is_primary = false;
        position = new Vector_2d();
        position_delta = new Vector_2d();
        position_initial = new Vector_2d();
        press_timeout_id = 0;
        shifted = false;
        swipe = false;
        target = null;
        timeStamp = 0;
        timeStamp_initial = 0;
        velocity = new Vector_2d();
    };

    static _attributes = {
        ...super._attributes,

        _swipe: false,

        disabled: false,
        flickTime_max: {
            default: 50,
            range: [0, 200],
        },
        gain: {
            default: 1,
            range: [0, Infinity],
        },
        press_time: {
            default: 800,
            range: [1, Infinity],
        },
        shift: {
            default: 1,
            range: [1, Infinity],
        },
        shift_jump: false,
        swipe_disabled: false,
        tap_disabled: false,
        taps_interval: {
            default: 400,
            range: [1, Infinity],
        },
    };


    static {
        this.define();
    }


    _pointers = new Map();
    _tap_prev_position = new Vector_2d();
    _tap_prev_timeStamp = 0;
    _taps_count = 0;


    get _swipe() {
        return this._attributes._swipe;
    }
    set _swipe(swipe) {
        this._attribute__set('_swipe', swipe);
    }


    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
        this._pointers__release();
    }

    get flickTime_max() {
        return this._attributes.flickTime_max;
    }
    set flickTime_max(flickTime_max) {
        this._attribute__set('flickTime_max', flickTime_max);
    }

    get gain() {
        return this._attributes.gain;
    }
    set gain(gain) {
        this._attribute__set('gain', gain);
    }

    get press_time() {
        return this._attributes.press_time;
    }
    set press_time(press_time) {
        this._attribute__set('press_time', press_time);
    }

    get shift() {
        return this._attributes.shift;
    }
    set shift(shift) {
        this._attribute__set('shift', shift);
    }

    get shift_jump() {
        return this._attributes.shift_jump;
    }
    set shift_jump(shift_jump) {
        this._attribute__set('shift_jump', shift_jump);
    }

    get swipe_disabled() {
        return this._attributes.swipe_disabled;
    }
    set swipe_disabled(swipe_disabled) {
        this._attribute__set('swipe_disabled', swipe_disabled);
        this._pointers__release();
    }

    get tap_disabled() {
        return this._attributes.tap_disabled;
    }
    set tap_disabled(tap_disabled) {
        this._attribute__set('tap_disabled', tap_disabled);
        this._pointers__release();
    }

    get taps_interval() {
        return this._attributes.taps_interval;
    }
    set taps_interval(taps_interval) {
        this._attribute__set('taps_interval', taps_interval);
    }


    _eventListeners__define() {
        this._eventListeners_shadow__add({
            lostpointercapture: this._on_lostPointerCapture.bind(this),
            pointerdown: this._on_pointerDown.bind(this),
        });
    }

    _flick__dispatch(pointer, timeStamp) {
        if (this.swipe_disabled || !pointer.swipe || timeStamp - pointer.timeStamp > this.flickTime_max) return;

        this.event__dispatch('flick', {pointer});
    }

    _init() {
        this.props__sync('disabled', 'swipe_disabled', 'tap_disabled');
    }

    _on_lostPointerCapture(event) {
        let pointer = this._pointers.get(event.pointerId);

        if (!pointer) return;

        this._pointers.delete(pointer.id);

        this._flick__dispatch(pointer, event.timeStamp);
        this._press__cancel(pointer);
        this._swipe_end__dispatch(pointer);
        this._tap__dispatch(pointer, event.timeStamp);
        this.event__dispatch('release', {pointer});

        if (!this._pointers.size) {
            this.removeEventListener('pointermove', this._on_pointerMove);
        }
    }

    _on_pointerDown(event) {
        if (this.disabled) return;

        if (!this._pointers.size) {
            this.addEventListener('pointermove', this._on_pointerMove);
        }

        let pointer = this._pointer__add(event);
        this._pointer__capture(pointer, event);
        this._press__init(pointer);
        this.event__dispatch('capture', {pointer});
    }

    _on_pointerMove(event) {
        let pointer = this._pointers.get(event.pointerId);
        this._pointer__update(pointer, event);

        this._press__cancel(pointer);
        this._swipe_begin__dispatch(pointer);
        this._swipe__dispatch(pointer);
    }

    _pointer__add(event) {
        let pointer = new this.constructor._Pointer();
        pointer.event_press_time = this.press_time;
        pointer.id = event.pointerId;
        pointer.is_primary = event.isPrimary;
        pointer.target = event.target;
        pointer.timeStamp = event.timeStamp;
        pointer.timeStamp_initial = pointer.timeStamp;
        pointer.position.set(event.pageX, event.pageY);
        pointer.position_initial.set_vector(pointer.position);
        this._pointers.set(pointer.id, pointer);

        return pointer;
    }

    _pointer__capture(pointer, event) {
        if (event.GestureArea__pointer_captured) return;

        event.GestureArea__pointer_captured = true;
        pointer.target.setPointerCapture(pointer.id);
    }

    _pointer__update(pointer, event) {
        pointer.timeStamp = event.timeStamp;
        pointer.velocity.set(event.pageX, event.pageY).sub(pointer.position).prod(this.gain);
        pointer.position.set(event.pageX, event.pageY);
        pointer.position_delta.set_vector(pointer.position).sub(pointer.position_initial);

        if (!pointer.shifted) {
            if (pointer.position_delta.length < this.shift) return;

            pointer.shifted = true;

            if (!this.shift_jump) {
                pointer.position_initial.sum(pointer.position_delta.length__set(this.shift - 1));
                pointer.position_delta.set_vector(pointer.position).sub(pointer.position_initial);
            }
        }

        pointer.position_delta.prod(this.gain);
    }

    _pointers__release() {
        for (let pointer of this._pointers.values()) {
            pointer.target.releasePointerCapture(pointer.id);
        }
    }

    _press__cancel(pointer) {
        if (!pointer.swipe && this._pointers.has(pointer.id)) return;

        clearTimeout(pointer.press_timeout_id);
    }

    _press__dispatch(pointer) {
        if (pointer.shifted || !this.contains(document.elementFromPoint(pointer.position.x, pointer.position.y))) return;

        this._taps_count__update(pointer);
        this.event__dispatch('press', {pointer, taps_count: this._taps_count});
    }

    _press__init(pointer) {
        if (this.tap_disabled) return;

        pointer.press_timeout_id = setTimeout(() => this._press__dispatch(pointer), this.press_time);
    }

    _swipe__dispatch(pointer) {
        if (this.swipe_disabled || !pointer.swipe) return;

        this.event__dispatch('swipe', {pointer});
    }

    _swipe_begin__dispatch(pointer) {
        if (this.swipe_disabled || pointer.swipe || !pointer.shifted) return;

        pointer.swipe = this.event__dispatch('swipe_begin', {pointer});
        this._swipe ||= pointer.swipe;
    }

    _swipe_end__dispatch(pointer) {
        if (this.swipe_disabled || !pointer.swipe) return;

        this._swipe = !!this._pointers.size;
        this.event__dispatch('swipe_end', {pointer});
    }

    _tap__dispatch(pointer, timeStamp) {
        if (
            this.tap_disabled
            || pointer.shifted
            || timeStamp - pointer.timeStamp_initial > this.press_time
            || !this.contains(document.elementFromPoint(pointer.position.x, pointer.position.y))
        ) return;

        this._taps_count__update(pointer);
        this.event__dispatch('tap', {pointer, taps_count: this._taps_count});
    }

    _taps_count__update(pointer) {
        if (
            pointer.timeStamp_initial - this._tap_prev_timeStamp <= this.taps_interval
            && this._tap_prev_position.sub(pointer.position).length <= this.shift
        ) {
            this._taps_count++;
        }
        else {
            this._taps_count = 1;
        }

        this._tap_prev_timeStamp = pointer.timeStamp_initial;
        this._tap_prev_position.set_vector(pointer.position);
    }


    refresh() {
        this._pointers__release();
    }
}
