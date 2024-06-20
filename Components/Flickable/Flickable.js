// 04.03.2024


import {GestureArea} from '../GestureArea/GestureArea.js';
import {TrackBar} from '../TrackBar/TrackBar.js';

import {Renderer} from '../../Units/Renderer/Renderer.js';
import {Vector_2d} from '../../Units/Vector_2d/Vector_2d.js';


export class Flickable extends GestureArea {
    static _components = [TrackBar];

    static _attributes = {
        ...super._attributes,

        _scroll_x: 0,
        _scroll_y: 0,
        _scrollEdge_x_begin: false,
        _scrollEdge_x_end: false,
        _scrollEdge_y_begin: false,
        _scrollEdge_y_end: false,

        acceleration: {
            default: 0,
            range: [0, Infinity],
        },
        jerk: {
            default: 0.01,
            range: [0, Infinity],
        },
        scrollBars: {
            default: '',
            enum: ['hidden', 'phantom'],
        },
        scrollEdge_size: {
            default: 1,
            range: [0, Infinity],
        },
        snag: '',
        sticky: false,
        velocity_max: {
            default: Infinity,
            range: [0, Infinity],
        },
    };

    static _elements = {
        scrollBar_x: '',
        scrollBar_y: '',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _acceleration = new Vector_2d();
    _jerk = new Vector_2d();
    _renderer = new Renderer({render: this._render.bind(this)});
    _scrollBars_values__define = this._scrollBars_values__define.bind(this);
    _scroll_x_factor = 0;
    _scroll_x_initial = 0;
    _scroll_y_factor = 0;
    _scroll_y_initial = 0;
    _sticky_x = true;
    _sticky_y = true;
    _velocity = new Vector_2d();
    _velocity_prev = new Vector_2d();


    get _scroll_x() {
        return this._attributes._scroll_x;
    }
    set _scroll_x(scroll_x) {
        this._attribute__set('_scroll_x', scroll_x);
    }

    get _scroll_y() {
        return this._attributes._scroll_y;
    }
    set _scroll_y(scroll_y) {
        this._attribute__set('_scroll_y', scroll_y);
    }

    get _scrollEdge_x_begin() {
        return this._attributes._scrollEdge_x_begin;
    }
    set _scrollEdge_x_begin(scrollEdge_x_begin) {
        this._attribute__set('_scrollEdge_x_begin', scrollEdge_x_begin);
    }

    get _scrollEdge_x_end() {
        return this._attributes._scrollEdge_x_end;
    }
    set _scrollEdge_x_end(scrollEdge_x_end) {
        this._attribute__set('_scrollEdge_x_end', scrollEdge_x_end);
    }

    get _scrollEdge_y_begin() {
        return this._attributes._scrollEdge_y_begin;
    }
    set _scrollEdge_y_begin(scrollEdge_y_begin) {
        this._attribute__set('_scrollEdge_y_begin', scrollEdge_y_begin);
    }

    get _scrollEdge_y_end() {
        return this._attributes._scrollEdge_y_end;
    }
    set _scrollEdge_y_end(scrollEdge_y_end) {
        this._attribute__set('_scrollEdge_y_end', scrollEdge_y_end);
    }


    get acceleration() {
        return this._attributes.acceleration;
    }
    set acceleration(acceleration) {
        this._attribute__set('acceleration', acceleration);
    }

    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
        this._elements.scrollBar_x.disabled = this.disabled;
        this._elements.scrollBar_y.disabled = this.disabled;
        this._pointers__release();
    }

    get gain() {
        return this._attributes.gain;
    }
    set gain(gain) {
        this._attribute__set('gain', gain);
        this._elements.scrollBar_x.gain = this.gain;
        this._elements.scrollBar_y.gain = this.gain;
    }

    get jerk() {
        return this._attributes.jerk;
    }
    set jerk(jerk) {
        this._attribute__set('jerk', jerk);
    }

    get scroll_x() {
        return this._slots.display.scrollLeft;
    }
    set scroll_x(scroll_x) {
        this._slots.display.scrollLeft = Math.min(Math.round(scroll_x), this._scroll_x);
    }

    get scroll_y() {
        return this._slots.display.scrollTop;
    }
    set scroll_y(scroll_y) {
        this._slots.display.scrollTop = Math.min(Math.round(scroll_y), this._scroll_y);
    }

    get scrollBars() {
        return this._attributes.scrollBars;
    }
    set scrollBars(scrollBars) {
        this._attribute__set('scrollBars', scrollBars);
        this.refresh();
    }

    get scrollEdge_size() {
        return this._attributes.scrollEdge_size;
    }
    set scrollEdge_size(scrollEdge_size) {
        this._attribute__set('scrollEdge_size', scrollEdge_size);
    }

    get shift() {
        return this._attributes.shift;
    }
    set shift(shift) {
        this._attribute__set('shift', shift);
        this._elements.scrollBar_x.shift = this.shift;
        this._elements.scrollBar_y.shift = this.shift;
    }

    get shift_jump() {
        return this._attributes.shift_jump;
    }
    set shift_jump(shift_jump) {
        this._attribute__set('shift_jump', shift_jump);
        this._elements.scrollBar_x.shift_jump = this.shift_jump;
        this._elements.scrollBar_y.shift_jump = this.shift_jump;
    }

    get snag() {
        return this._attributes.snag;
    }
    set snag(snag) {
        this._attribute__set('snag', snag);
    }

    get sticky() {
        return this._attributes.sticky;
    }
    set sticky(sticky) {
        this._attribute__set('sticky', sticky);
    }

    get velocity_max() {
        return this._attributes.velocity_max;
    }
    set velocity_max(velocity_max) {
        this._attribute__set('velocity_max', velocity_max);
    }


    _display__on_scroll() {
        cancelAnimationFrame(this._animationFrame);
        this._animationFrame = requestAnimationFrame(this._scrollBars_values__define);

        this._scrollEdges__define();
        this._sticky_x = this._scrollEdge_x_end || !this._scroll_x;
        this._sticky_y = this._scrollEdge_y_end || !this._scroll_y;
    }

    _eventListeners__define() {
        super._eventListeners__define();

        this.eventListeners__add({
            flick: this._on_flick,
            swipe: this._on_swipe,
            swipe_begin: this._on_swipe_begin,
        });
        this._elements.scrollBar_x.addEventListener('change', this._scrollBar_x__on_value_change.bind(this));
        this._elements.scrollBar_y.addEventListener('change', this._scrollBar_y__on_value_change.bind(this));
        this._slots.display.addEventListener('scroll', this._display__on_scroll.bind(this));
    }

    _init() {
        super._init();

        this.refresh();
    }

    _on_flick(event) {
        this._velocity.set_vector(event.detail.pointer.velocity).length__to_range(-this.velocity_max, this.velocity_max);
        this._acceleration.set_vector(this._velocity).invert().length__set(this.acceleration);
        this._jerk.set_vector(this._velocity).invert().length__set(this.jerk);

        this._renderer.run();
    }

    _on_pointerDown(event) {
        super._on_pointerDown(event);

        this._renderer.stop();
    }

    _on_swipe(event) {
        let pointer = event.detail.pointer;
        this.scroll_x = this._scroll_x_initial - pointer.position_delta.x;
        this.scroll_y = this._scroll_y_initial - pointer.position_delta.y;
    }

    _on_swipe_begin(event) {
        let target = event.detail.pointer.target;

        if (target instanceof TrackBar || this._snag__check(target)) {
            event.preventDefault();

            return;
        }

        this._scroll_x_initial = this.scroll_x;
        this._scroll_y_initial = this.scroll_y;
    }

    _render() {
        let scroll_x_prev = this.scroll_x;
        let scroll_y_prev = this.scroll_y;
        this.scroll_x -= this._velocity.x;
        this.scroll_y -= this._velocity.y;

        if (this.scroll_x != scroll_x_prev || this.scroll_y != scroll_y_prev) {
            this._velocity_prev.set_vector(this._velocity);
            this._velocity.sub(this._acceleration);

            if (this._velocity.cos__get(this._velocity_prev) > 0) {
                this._acceleration.sub(this._jerk);

                return;
            }
        }

        this._renderer.stop();
    }

    _scrollEdges__define() {
        this._scrollEdge_x_begin = this._scroll_x && this.scroll_x <= this.scrollEdge_size;
        this._scrollEdge_x_end = this._scroll_x && this._scroll_x - this.scroll_x <= this.scrollEdge_size;
        this._scrollEdge_y_begin = this._scroll_y && this.scroll_y <= this.scrollEdge_size;
        this._scrollEdge_y_end = this._scroll_y && this._scroll_y - this.scroll_y <= this.scrollEdge_size;
    }

    _scrollBar_x__on_value_change() {
        this.scroll_x = this._elements.scrollBar_x.value * this._scroll_x_factor;
        this._renderer.stop();
    }

    _scrollBar_y__on_value_change() {
        this.scroll_y = this._elements.scrollBar_y.value * this._scroll_y_factor;
        this._renderer.stop();
    }

    _scrollBars__refresh() {
        this._scroll_x = this._slots.display.scrollWidth - this._slots.display.clientWidth;
        this._scroll_y = this._slots.display.scrollHeight - this._slots.display.clientHeight;
        this._scroll_x = this._slots.display.scrollWidth - this._slots.display.clientWidth;

        if (this._scroll_x) {
            this._elements.scrollBar_x.track_length__define();
            let puck_x__length = Math.round(this._slots.display.clientWidth / this._slots.display.scrollWidth * this._elements.scrollBar_x._track_length);
            this.style.setProperty('--_Flickable__puck_x__length', puck_x__length);
            this._elements.scrollBar_x.puck_length__define();

            this._elements.scrollBar_x.value_max = 0;
            this._scroll_x_factor = this._scroll_x / this._elements.scrollBar_x.value_max;
        }

        if (this._scroll_y) {
            this._elements.scrollBar_y.track_length__define();
            let puck_y__length = Math.round(this._slots.display.clientHeight / this._slots.display.scrollHeight * this._elements.scrollBar_y._track_length);
            this.style.setProperty('--_Flickable__puck_y__length', puck_y__length);
            this._elements.scrollBar_y.puck_length__define();

            this._elements.scrollBar_y.value_max = 0;
            this._scroll_y_factor = this._scroll_y / this._elements.scrollBar_y.value_max;
        }
    }

    _scrollBars_values__define() {
        if (this._scroll_x) {
            this._elements.scrollBar_x.value = this.scroll_x / this._scroll_x_factor;
        }

        if (this._scroll_y) {
            this._elements.scrollBar_y.value = this.scroll_y / this._scroll_y_factor;
        }
    }

    _snag__check(element) {
        try {
            let snag = element.closest(this.snag);

            if (!this.contains(snag)) return false;
        }
        catch {
            return false;
        }

        return true;
    }


    refresh() {
        if (!this.visible__get()) return;

        this._scrollBars__refresh();
        this._scrollEdges__define();

        if (this.sticky) {
            if (this._sticky_x) {
                this.scroll_x = this._scroll_x;
            }

            if (this._sticky_y) {
                this.scroll_y = this._scroll_y;
            }
        }

        this._scrollBars_values__define();
    }
}
