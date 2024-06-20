// 19.03.2024


import {GestureArea} from '../GestureArea/GestureArea.js';

import {Common} from '../../Units/Common/Common.js';
import {Renderer} from '../../Units/Renderer/Renderer.js';


export class Leafable extends GestureArea {
    static _attributes = {
        ...super._attributes,

        _animation_begin: {
            default: 0,
            enum: [-1, 1],
        },
        _animation_end: {
            default: 0,
            enum: [-1, 1],
        },

        animation_implicit: false,
        animation_implicit_direction: {
            default: 0,
            enum: [-1, 1],
        },
        delta: {
            default: 0.5,
            range: [0, 1],
        },
        elastic: false,
        index: {
            default: 0,
            persistent: true,
        },
        looped: false,
        velocity_min: {
            default: 5,
            range: [0, Infinity],
        },
        vertical: false,
    };

    static _elements = {
        item_current: '',
        item_prev: '',
    };


    static animations_duration_special = 1e10;
    static css_url = true;
    static html_url = true;
    static url = import.meta.url;

    static shadow_opts = {
        ...super.shadow_opts,

        slotAssignment: 'manual',
    };


    static {
        this.define();
    }


    _animations = null;
    _animations_direction = 0;
    _animations_duration = 0;
    _animations_playbackRate = 0;
    _animations_progress = 0;
    _animations_progress_increment = 0;
    _delta = 0;
    _index_prev = NaN;
    _item_current_index = NaN;
    _item_prev_index = NaN;
    _renderer = new Renderer({render: this._render.bind(this)});
    _size = 0;
    _velocity = 0;


    get _animation_begin() {
        return this._attributes._animation_begin;
    }
    set _animation_begin(animation_begin) {
        this._attribute__set('_animation_begin', animation_begin);
    }

    get _animation_end() {
        return this._attributes._animation_end;
    }
    set _animation_end(animation_end) {
        this._attribute__set('_animation_end', animation_end);
    }


    get animation_implicit() {
        return this._attributes.animation_implicit;
    }
    set animation_implicit(animation_implicit) {
        this._attribute__set('animation_implicit', animation_implicit);
    }

    get animation_implicit_direction() {
        return this._attributes.animation_implicit_direction;
    }
    set animation_implicit_direction(animation_implicit_direction) {
        this._attribute__set('animation_implicit_direction', animation_implicit_direction);
    }

    get delta() {
        return this._attributes.delta;
    }
    set delta(delta) {
        this._attribute__set('delta', delta);
    }

    get elastic() {
        return this._attributes.elastic;
    }
    set elastic(elastic) {
        this._attribute__set('elastic', elastic);
    }

    get gain() {
        return this._attributes.gain;
    }
    set gain(gain) {
        this._attribute__set('gain', gain);
    }

    get index() {
        return this._attributes.index;
    }
    set index(index) {
        if (this._renderer._active) return;

        if (!this.children.length) {
            this._index_prev = NaN;
            this._attribute__set('index', NaN);

            return;
        }

        this._index_prev = this.index;
        this._attribute__set('index', this._index__proc(index));

        if (this.animation_implicit || this._animations) {
            if (!this._animations && this._index_prev != this.index) {
                this._animations_direction__set(this.animation_implicit_direction || this._index_prev - this.index);
                this._item_current__set(this.index);
                this._item_prev__set(this._index_prev);
            }

            if (this._animations) {
                this._animations_playbackRate = this.index == this._item_prev_index ? -1 : 1;
                this._renderer.run();
            }
        }

        if (!this._animations) {
            this._item_current__set(this.index);
            this._item_prev__set();
        }
    }

    get looped() {
        return this._attributes.looped;
    }
    set looped(looped) {
        this._attribute__set('looped', looped);
    }

    get velocity_min() {
        return this._attributes.velocity_min;
    }
    set velocity_min(velocity_min) {
        this._attribute__set('velocity_min', velocity_min);
    }

    get vertical() {
        return this._attributes.vertical;
    }
    set vertical(vertical) {
        this._attribute__set('vertical', vertical);
    }


    _animations_direction__set(animations_direction = 0) {
        this._animations_direction = Common.to_range(animations_direction, -1, 1) ^ 0;

        if (this._animations_direction) {
            this._animation_begin = this._animations_direction;
            this._animation_end = null;
            this._shadow.getAnimations();
            this._animation_begin = null;
            this._animation_end = this._animations_direction;
            this._animations = [...this._elements.item_current.getAnimations(), ...this._elements.item_prev.getAnimations()];

            for (let animation of this._animations) {
                this._animations_duration = Math.max(this._animations_duration, animation.effect.getComputedTiming().duration);

                animation.pause();
                animation.effect.updateTiming({duration: this.constructor.animations_duration_special});
            }
        }
        else {
            this._animations = null;
            this._animation_end = null;
            this._shadow.getAnimations();
        }
    }

    _animations_progress__set(animations_progress = 0) {
        this._animations_progress = Common.to_range(animations_progress, 0, 1);

        if (!this._animations) return;

        for (let animation of this._animations) {
            animation.currentTime = Common.to_range(this.constructor.animations_duration_special * this._animations_progress, 1, this.constructor.animations_duration_special - 1);
        }
    }

    _eventListeners__define() {
        super._eventListeners__define();

        this.eventListeners__add({
            capture: this._on_capture,
            flick: this._on_flick,
            release: this._on_release,
            swipe: this._on_swipe,
            swipe_begin: this._on_swipe_begin,
        });
    }

    _index__proc(index) {
        let f = this.looped ? Common.to_ring : Common.to_range;

        return f(index, 0, this.children.length - 1);
    }

    _init() {
        super._init();

        this.props__sync('index');
    }

    _item_current__set(item_current_index = NaN) {
        this._item_current_index = this._index__proc(item_current_index);

        if (isNaN(this._item_current_index)) {
            this._elements.item_current.assign();
        }
        else {
            this._elements.item_current.assign(this.children[this._item_current_index]);
        }
    }

    _item_prev__set(item_prev_index = NaN) {
        this._item_prev_index = this._index__proc(item_prev_index);

        if (isNaN(this._item_prev_index)) {
            this._elements.item_prev.assign();
        }
        else {
            this._elements.item_prev.assign(this.children[this._item_prev_index]);
        }
    }

    _on_capture() {
        if (!this._animations) return;

        this._delta = this._animations_progress * this._size * this._animations_direction / this.gain;
        this._velocity = 0;
        this._renderer.stop();
    }

    _on_flick(event) {
        let pointer = event.detail.pointer;
        let velocity = this.vertical ? pointer.velocity.y : pointer.velocity.x;
        let velocity_abs = Math.abs(velocity);

        if (velocity_abs < this.velocity_min) {
            this._velocity = 0;
            this._animations_progress_increment = 0;
        }
        else {
            this._velocity = velocity;
            this._animations_progress_increment = velocity_abs / this._size * this.gain;
        }
    }

    _on_release() {
        if (!this._animations) return;

        if (
            !this._velocity && this._animations_progress < this.delta
            || this._velocity && Math.sign(this._velocity) != this._animations_direction
        ) {
            this.index = this._item_prev_index;
        }
        else {
            this.index = this._item_current_index;
        }

        this.event__dispatch('change');
    }

    _on_swipe(event) {
        let pointer = event.detail.pointer;
        let delta = this._delta + (this.vertical ? pointer.position_delta.y : pointer.position_delta.x);
        let animation_direction = Math.sign(delta || 1);

        if (!this._delta && this._animations_direction != animation_direction) {
            this._animations_direction__set(animation_direction);
            this._item_current__set(this.index - this._animations_direction);
            this._item_prev__set(this.index);
        }

        if (!this.gain || !this.elastic && this._item_prev_index == this._item_current_index) return;

        this._animations_progress__set(delta / this._size * this._animations_direction * this.gain);
    }

    _on_swipe_begin(event) {
        if (!this.children.length) {
            event.preventDefault();

            return;
        }

        this._size = this.vertical ? this.height_inner__get() : this.width_inner__get();
    }

    _render() {
        if (
            this._animations_playbackRate < 0 && this._animations_progress <= 0
            || this._animations_playbackRate > 0 && this._animations_progress >= 1
        ) {
            this._renderer.stop();

            this._animations_progress_increment = 0;
            this._delta = 0;
            this._velocity = 0;
            this._animations_direction__set();
            this.index = this.index;
            this._animations_progress__set();

            this.event__dispatch('animation_end');

            return;
        }

        let animations_progress_increment_min = this._renderer._dt / this._animations_duration;
        let animations_progress_increment = this._animations_playbackRate < 0
            ? -animations_progress_increment_min
            : Math.max(this._animations_progress_increment, animations_progress_increment_min)
        ;
        this._animations_progress__set(this._animations_progress + animations_progress_increment);
    }
}
