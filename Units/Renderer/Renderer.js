// 19.02.2024


export class Renderer {
    _active = false;
    _dt = 0;
    _loop_num = 0;
    _render = this._render.bind(this);
    _request_id = 0;
    _timeStamp = 0;


    _render() {
        let timeStamp = performance.now();
        this._dt = timeStamp - this._timeStamp;
        this._timeStamp = timeStamp;

        this.render(this);

        if (!this._active) return;

        this._loop_num++;
        this._request_id = requestAnimationFrame(this._render);
    }


    constructor(opts = {}) {
        if (!opts) return;

        this.init(opts);
    }

    init({render = this.render} = {}) {
        this.render = render;
    }

    render(renderer = null) {}

    run() {
        if (this._active) return false;

        this._active = true;
        this._request_id = requestAnimationFrame(this._render);
        this._timeStamp = performance.now();

        return true;
    }

    stop() {
        if (!this._active) return false;

        cancelAnimationFrame(this._request_id);

        this._active = false;
        this._loop_num = 0;
        this._request_id = 0;

        return true;
    }
}
