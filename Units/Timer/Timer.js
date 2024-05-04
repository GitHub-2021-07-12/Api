// 02.11.2022


import {Common} from '../Common/Common.js';
import {Random} from '../Random/Random.js';


export class Timer {
    _action_processor = this._action_processor.bind(this);
    _action_timeout_id = 0;
    _actions_count = 0;
    _actions_running = new Set();
    _awake = this.awake.bind(this);
    _complete = Promise.resolve();
    _sleep_resolve = null;
    _sleep_timeout_id = 0;
    _stopped = Promise.resolve();
    _stopped_resolve = null;
    _timeout_id = 0;


    actions_count_max = 1;
    actions_running_count_max = 1;
    delay_max = 0;
    delay_min = 1;


    async _action__run() {
        this._actions_count++;

        let promise = this.action().catch((error) => console.log(this.constructor.name, ':', error));
        this._actions_running.add(promise);
        await promise;
        this._actions_running.delete(promise);
    }

    async _action_processor() {
        if (this._actions_count >= this.actions_count_max) {
            this.stop();

            return;
        }

        if (this._actions_running.size < this.actions_running_count_max) {
            this._action__run();
        }
        else {
            await Promise.any([...this._actions_running.values()]);
        }

        if (!this._action_timeout_id) return;

        let delay = this.delay_max > this.delay_min ? Random.number(this.delay_min * 1e3, this.delay_max * 1e3) : this.delay_min * 1e3;
        this._action_timeout_id = setTimeout(this._action_processor, this._delay__proc(delay));
    }

    async _complete__create() {
        this._stopped = new Promise((resolve) => this._stopped_resolve = resolve);
        await this._stopped;
        await Promise.all([...this._actions_running.values()]);
    }

    _delay__proc(delay) {
        return Common.to_range(delay, 0, 2 ** 31 - 1);
    }


    async action() {}

    awake() {
        if (!this._sleep_timeout_id) return false;

        clearTimeout(this._sleep_timeout_id);
        this._sleep_resolve();
        this._sleep_resolve = null;
        this._sleep_timeout_id = 0;

        return true;
    }

    constructor(opts = {}) {
        if (!opts) return;

        this.init(opts);
    }

    init({delay_min = this.delay_min, delay_max = this.delay_max} = {}) {
        this.delay_max = delay_max;
        this.delay_min = delay_min;
    }

    run() {
        if (this._actions_running.size || this._action_timeout_id) return false;

        this._action_timeout_id = setTimeout(this._action_processor);
        this._complete = this._complete__create();

        return true;
    }

    async sleep(delay_min = -1, delay_max = -1) {
        if (this._sleep_timeout_id) return;

        if (!~delay_min && !~delay_max) {
            delay_min = this.delay_min;
            delay_max = this.delay_max;
        }

        let delay = delay_max > delay_min ? Random.number(delay_min * 1e3, delay_max * 1e3) : delay_min * 1e3;
        this._sleep_timeout_id = setTimeout(this._awake, this._delay__proc(delay));
        await new Promise((resolve) => this._sleep_resolve = resolve);
    }

    stop() {
        if (!this._action_timeout_id) return false;

        clearTimeout(this._action_timeout_id);
        this._stopped_resolve();
        this._action_timeout_id = 0;
        this._actions_count = 0;
        this._stopped_resolve = null;

        return true;
    }

    timeout__clear() {
        clearTimeout(this._timeout_id);
    }

    timeout__set(callback, delay) {
        this.timeout__clear();
        this._timeout_id = setTimeout(callback, this._delay__proc(delay * 1e3));
    }

    async timing(asyncFunction) {
        let date = new Date();
        await asyncFunction();

        return new Date() - date;
    }
}
