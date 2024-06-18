// 26.02.2024


import {Component} from '../Component/Component.js';

import {Vector_2d} from '../../Units/Vector_2d/Vector_2d.js';


export class SwipeArea extends Component {
    static _Pointer = class {
        active = false;
        id = -1;
        position = new Vector_2d();
        position_delta = new Vector_2d();
        position_initial = null;
        position_inner = new Vector_2d();
        position_inner_initial = new Vector_2d();
        timeStamp = 0;
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
        shift: {
            default: 1,
            range: [1, Infinity],
        },
        shift_jump: false,
    };


    static {
        this.define();
    }


    _pointers = new Map();


    pointers_count_max = 1;


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

        for (let pointer of this._pointers.values()) {
            this.releasePointerCapture(pointer.id);
        }
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


    _eventListeners__define() {
        this.eventListeners__add({
            lostpointercapture: this._on_lostPointerCapture,
            pointerdown: this._on_pointerDown,
        });
        this.addEventListener('pointermove', this._on_pointerMove);
    }

    _init() {
        this.props__sync('disabled');
    }

    _on_lostPointerCapture(event) {
        console.log('lostpointercapture')

        let pointer = this._pointers.get(event.pointerId);

        if (!pointer) return;

        // event.stopPropagation();

        if (pointer.active) {
            if (event.timeStamp - pointer.timeStamp <= this.flickTime_max) {
                this.event__dispatch('flick', {_pointer: pointer});
            }

            this._swipe = false;
            this.event__dispatch('swipe_end', {_pointer: pointer});
        }

        this.event__dispatch('release');

        this._pointers.delete(event.pointerId);

        if (this._pointers.size) return;

        this.removeEventListener('pointermove', this._on_pointerMove);
    }

    _on_pointerDown(event) {
        if (this.disabled || this._pointers.size >= this.pointers_count_max || !this.event__dispatch('capture', {target: event.target})) return;
        // if (event.SwipeArea__pointer_captured || this.disabled || this._pointers.size >= this.pointers_count_max || !this.event__dispatch('capture', {target: event.target})) return;

        // event.stopPropagation();

        let pointer = new this.constructor._Pointer();
        pointer.id = event.pointerId;
        this._pointers.set(pointer.id, pointer);

        event.SwipeArea__pointer_captured = true;
        this.addEventListener('pointermove', this._on_pointerMove);
        this.setPointerCapture(pointer.id);

        setTimeout(() => console.log(this, this.hasPointerCapture(pointer.id)))
    }

    _on_pointerMove(event) {
        let pointer = this._pointers.get(event.pointerId);

        if (!pointer) return;

        // event.stopPropagation();

        pointer.timeStamp = event.timeStamp;
        pointer.velocity.set(event.pageX, event.pageY).sub(pointer.position).prod(this.gain);
        pointer.position.set(event.pageX, event.pageY);
        pointer.position_inner.set(event.offsetX, event.offsetY);

        if (!pointer.position_initial) {
            pointer.position_initial = pointer.position.clone();
            pointer.position_inner_initial.set_vector(pointer.position_inner);

            return;
        }

        pointer.position_delta.set_vector(pointer.position).sub(pointer.position_initial);

        if (!pointer.active) {
            if (pointer.position_delta.length < this.shift) return;

            pointer.active = true;

            if (!this.shift_jump) {
                pointer.position_initial.sum(pointer.position_delta.length__set(this.shift - 1));
                pointer.position_delta.set_vector(pointer.position).sub(pointer.position_initial);
            }

            this._swipe = true;
            this.event__dispatch('swipe_begin', {_pointer: pointer});
        }

        pointer.position_delta.prod(this.gain);

        this.event__dispatch('swipe', {_pointer: pointer});
    }
}
