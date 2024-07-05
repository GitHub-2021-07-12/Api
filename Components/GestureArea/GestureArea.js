// 12.06.2024


import {Component} from '../Component/Component.js';

import {Vector_2d} from '../../Units/Vector_2d/Vector_2d.js';


export class GestureArea extends Component {
    static _Pointer = class {
        static points_count_max = 4;


        _points = [];
        _velocity = new Vector_2d();


        id = 0;
        movement = new Vector_2d();
        position = new Vector_2d();
        position_delta = new Vector_2d();
        position_initial = new Vector_2d();
        position_inner = new Vector_2d();
        position_inner_initial = new Vector_2d();
        press_timeout_id = 0;
        shifted = false;
        swipe = false;
        target = null;
        timeStamp = 0;
        timeStamp_initial = 0;


        capture() {
            this.target?.setPointerCapture(this.id);
        }

        points__update() {
            let point = {
                position: this.position.clone(),
                timeStamp: this.timeStamp,
            };
            this._points.push(point);

            if (this._points.length > this.constructor.points_count_max) {
                this._points.shift();
            }
        }

        release() {
            this.target?.releasePointerCapture(this.id);
        }

        velocity__define() {
            let point_first = this._points[0];
            let point_last = this._points.at(-1);
            let dt = (point_last?.timeStamp - point_first?.timeStamp) / 1e3;

            if (!dt) return;

            this._velocity.set_vector(point_last.position).sub(point_first.position).divide(dt);
        }
    };

    static _attributes = {
        ...super._attributes,

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

    static _eventListeners_shadow = {
        dragstart: '_on_dragStart',
        pointerdown: '_on_pointerDown',
        pointerup: '_on_pointerUp',
    };


    static {
        this.define();
    }


    _pointers = new Map();
    _tap_first_position = null;
    _tap_prev_timeStamp = 0;
    _taps_count = 0;
    _timeStamp = 0;


    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
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
    }

    get tap_disabled() {
        return this._attributes.tap_disabled;
    }
    set tap_disabled(tap_disabled) {
        this._attribute__set('tap_disabled', tap_disabled);
    }

    get taps_interval() {
        return this._attributes.taps_interval;
    }
    set taps_interval(taps_interval) {
        this._attribute__set('taps_interval', taps_interval);
    }


    _capture__make(pointer) {
        this._press__init(pointer);
        this.event__dispatch('capture', {pointer});
    }

    _flick__make(pointer) {
        if (this.swipe_disabled || !pointer.swipe || this._timeStamp - pointer.timeStamp > this.flickTime_max) return;

        pointer.velocity__define();

        if (pointer._velocity.is_zero()) return;

        this.event__dispatch('flick', {pointer});
    }

    _on_dragStart(event) {
        event.preventDefault();
    }

    _on_pointerDown(event) {
        if (this.disabled) return;

        if (!this._pointers.size) {
            this.addEventListener('pointermove', this._on_pointerMove);
        }

        this._timeStamp__update();

        let pointer = this._pointer__add(event);
        this._capture__make(pointer);
    }

    _on_pointerMove(event) {
        if (this.disabled) return;

        let pointer = this._pointers.get(event.pointerId);

        if (!pointer) return;

        this._timeStamp__update();

        this._pointer__update(pointer, event);
        this._press__cancel(pointer);
        this._swipe__make(pointer);
    }

    _on_pointerUp(event) {
        let pointer = this._pointers.get(event.pointerId);

        if (!pointer) return;

        this._timeStamp__update();

        this._tap__make(pointer);
        this._swipe__stop(pointer);
        this._flick__make(pointer);
        this._release__make(pointer);

        this._pointer__delete(pointer);
        this._press__cancel(pointer);

        if (!this._pointers.size) {
            this.removeEventListener('pointermove', this._on_pointerMove);
        }
    }

    _pointer__add(event) {
        let pointer = new this.constructor._Pointer();
        pointer.id = event.pointerId;
        pointer.target = event.target;
        pointer.timeStamp_initial = this._timeStamp;
        pointer.timeStamp = pointer.timeStamp_initial;
        pointer.position_initial.set(event.pageX, event.pageY);
        pointer.position_inner_initial.set(event.offsetX, event.offsetY);
        pointer.position.set_vector(pointer.position_initial);
        pointer.points__update();
        this._pointers.set(pointer.id, pointer);

        this._pointer_main = pointer;

        if (!event.GestureArea__pointer_captured) {
            event.GestureArea__pointer_captured = true;
            pointer.capture();
        }

        return pointer;
    }

    _pointer__delete(pointer) {
        pointer.release();
        this._pointers.delete(pointer.id);

        if (pointer == this._pointer_main) {
            this._pointer_main = null;
        }
    }

    _pointer__update(pointer, event) {
        pointer.timeStamp = this._timeStamp;
        pointer.movement.set(event.pageX, event.pageY).sub(pointer.position);
        pointer.position.set(event.pageX, event.pageY);
        pointer.position_delta.set_vector(pointer.position).sub(pointer.position_initial);
        pointer.position_inner.set(event.offsetX, event.offsetY);

        if (!pointer.shifted) {
            if (pointer.position_delta.length < this.shift) return;

            pointer.shifted = true;

            if (!this.shift_jump) {
                pointer.position_initial.sum(pointer.position_delta.length__set(this.shift - 1));
                pointer.position_delta.set(0);
            }
        }

        pointer.points__update();
        pointer.position_delta.prod(this.gain);
    }

    _press__cancel(pointer) {
        if (!pointer.shifted && this._pointers.has(pointer.id)) return;

        clearTimeout(pointer.press_timeout_id);
    }

    _press__init(pointer) {
        if (this.tap_disabled) return;

        pointer.press_timeout_id = setTimeout(() => this._press__make(pointer), this.press_time);
    }

    _press__make(pointer) {
        if (pointer.shifted || !this.contains(document.elementFromPoint(pointer.position.x, pointer.position.y))) return;

        this._taps_count__update(pointer);
        this.event__dispatch('press', {pointer, taps_count: this._taps_count});
    }

    _release__make(pointer) {
        this.event__dispatch('release', {pointer});
    }

    _swipe__make(pointer) {
        if (this.swipe_disabled || !pointer.shifted) return;

        if (!pointer.swipe) {
            pointer.swipe = this.event__dispatch('swipe_start', {pointer});
        }

        if (pointer.swipe) {
            this.event__dispatch('swipe', {pointer});
        }
    }

    _swipe__stop(pointer) {
        if (this.swipe_disabled || !pointer.swipe) return;

        this.event__dispatch('swipe_stop', {pointer});
    }

    _tap__make(pointer) {
        if (
            this.tap_disabled
            || pointer.shifted
            || this._timeStamp - pointer.timeStamp_initial > this.press_time
            || !this.contains(document.elementFromPoint(pointer.position.x, pointer.position.y))
        ) return;

        this._taps_count__update(pointer);
        this.event__dispatch('tap', {pointer, taps_count: this._taps_count});
    }

    _taps_count__update(pointer) {
        if (
            pointer.timeStamp_initial - this._tap_prev_timeStamp <= this.taps_interval
            && this._tap_first_position?.clone().sub(pointer.position).length <= this.shift
        ) {
            this._taps_count++;
        }
        else {
            this._tap_first_position = pointer.position;
            this._taps_count = 1;
        }

        this._tap_prev_timeStamp = pointer.timeStamp;
    }

    _timeStamp__update() {
        this._timeStamp = performance.now();
    }
}
