import {Component} from '../Component/Component.js';


export class Switch extends Component {
    static _attributes = {
        ...super._attributes,

        _animation: false,

        animation_implicit: false,
        disabled: false,
        on: false,
        vertical: false,
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    get _animation() {
        return this._attributes._animation;
    }
    set _animation(animation) {
        this._attribute__set('_animation', animation);
    }


    get animation_implicit() {
        return this._attributes.animation_implicit;
    }
    set animation_implicit(animation_implicit) {
        this._attribute__set('animation_implicit', animation_implicit);
    }

    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
    }

    get on() {
        return this._attributes.on;
    }
    set on(on) {
        this._attribute__set('on', on);
        this._animation ||= this.animation_implicit;
    }

    get vertical() {
        return this._attributes.vertical;
    }
    set vertical(vertical) {
        this._attribute__set('vertical', vertical);
    }


    _eventListeners__define() {
        this.eventListeners__add({
            pointerdown: this._on_pointerDown,
            transitionend: this._on_transitionEnd,
        });
    }

    _on_pointerDown() {
        if (this.disabled) return;

        this._animation = true;
        this.toggle();

        this.event__dispatch('toggle');
    }

    _on_transitionEnd() {
        this._animation = false;
    }


    toggle() {
        this.on = !this.on;
    }
}
