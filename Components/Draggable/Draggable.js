// 08.01.2023


import {GestureArea} from '../GestureArea/GestureArea.js';

import {Vector_2d} from '../../Units/Vector_2d/Vector_2d.js';


export class Draggable extends GestureArea {
    static _attributes = {
        ...super._attributes,

        _drag: false,


        axis: {
            default: '',
            enum: ['x', 'y'],
        },
        handle: '',
        radius: {
            default: Infinity,
            range: [1, Infinity],
        },
        spring: false,
        step: {
            default: 1,
            range: [1, Infinity],
        },
        step_x: {
            default: 0,
            range: [1, Infinity],
        },
        step_y: {
            default: 0,
            range: [1, Infinity],
        },
        unbounded: false,
    };

    static _eventListeners = {
        swipe: '_on_swipe',
        swipe_start: '_on_swipe_start',
        swipe_stop: '_on_swipe_stop',
    };


    static {
        this.define();
    }


    _handle = null;
    _pointer_delta = new Vector_2d();
    _position = new Vector_2d();
    _position_delta = new Vector_2d();
    _position_max = new Vector_2d();
    _position_min = new Vector_2d();


    position_initial = this.position;
    position_max = null;
    position_min = null;


    get _drag() {
        return this._attributes._drag;
    }
    set _drag(drag) {
        this._attribute__set('_drag', drag);
    }


    get axis() {
        return this._attributes.axis;
    }
    set axis(axis) {
        this._attribute__set('axis', axis);
    }

    get handle() {
        return this._handle;
    }
    set handle(handle) {
        this._handle = handle;
        this._attribute__set('handle', this._handle);
    }

    get position() {
        return new Vector_2d(this.left__get(), this.top__get());
    }
    set position(position) {
        this.left__set(position.x);
        this.top__set(position.y);
    }

    get radius() {
        return this._attributes.radius;
    }
    set radius(radius) {
        this._attribute__set('radius', radius);
    }

    get spring() {
        return this._attributes.spring;
    }
    set spring(spring) {
        this._attribute__set('spring', spring);
    }

    get step() {
        return this._attributes.step;
    }
    set step(step) {
        this._attribute__set('step', step);
    }

    get step_x() {
        return this._attributes.step_x;
    }
    set step_x(step_x) {
        this._attribute__set('step_x', step_x);
    }

    get step_y() {
        return this._attributes.step_y;
    }
    set step_y(step_y) {
        this._attribute__set('step_y', step_y);
    }

    get unbounded() {
        return this._attributes.unbounded;
    }
    set unbounded(unbounded) {
        this._attribute__set('unbounded', unbounded);
    }


    _drag__make(pointer) {
        this._pointer_delta
            .set_vector(pointer.position_delta)
            .sum(this._position_delta)
            .length__to_range(0, this.radius)
        ;

        if (this.axis != 'x') {
            let step = this.step_y || this.step;
            this._position.y = this.position_initial.y + Math.round(this._pointer_delta.y / step) * step;
        }

        if (this.axis != 'y') {
            let step = this.step_x || this.step;
            this._position.x = this.position_initial.x + Math.round(this._pointer_delta.x / step) * step;
        }

        this._position.to_range(this._position_min, this._position_max).round();
        this.position = this._position;

        this.event__dispatch('drag');
    }

    _drag__start() {
        this._drag = true;
        this._position.set_vector(this.position);
        this._position_delta.set_vector(this._position).sub(this.position_initial);

        if (this.position_max) {
            this._position_max.set_vector(this.position_max);
        }
        else if (!this.unbounded) {
            this._position_max.x = Math.max(this.constructor.width_inner__get(this.offsetParent) - this.width_outer__get(), 0);
            this._position_max.y = Math.max(this.constructor.height_inner__get(this.offsetParent) - this.height_outer__get(), 0);
        }
        else {
            this._position_max.set(Infinity);
        }

        if (this.position_min) {
            this._position_min.set_vector(this.position_min);
        }
        else if (!this.unbounded) {
            this._position_min.set(0);
        }
        else {
            this._position_min.set(-Infinity);
        }

        this.event__dispatch('drag_start');
    }

    _drag__stop() {
        this._drag = false;
        this.event__dispatch('drag_stop');

        if (!this.spring) return;

        requestAnimationFrame(() => this.position = this.position_initial);
    }

    _handle__check(target) {
        try {
            let handle = this.handle instanceof HTMLElement ? this.handle : target.closest(this.handle);

            return this.contains(handle) && handle.contains(target);
        }
        catch {}

        return true;
    }

    _init() {
        this.props__sync('handle');
    }

    _on_swipe(event) {
        let pointer = event.detail.pointer;

        if (pointer != this._pointer_main) return;

        this._drag__make(pointer);
    }

    _on_swipe_start(event) {
        let pointer = event.detail.pointer;

        if (pointer != this._pointer_main || !this._handle__check(pointer.target)) {
            event.preventDefault();

            return;
        }

        this._drag__start();
    }

    _on_swipe_stop(event) {
        if (event.detail.pointer != this._pointer_main) return;

        this._drag__stop();
    }
}
