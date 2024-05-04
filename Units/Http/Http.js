import {Timer} from '../Timer/Timer.js';


export class Http {
    static _responses = {};


    static cache = false;
    static loops_count = 1;
    static timer_fetch = new Timer(1, 5);


    static async fetch(url, opts = {}) {
        opts.__cache ??= this.cache;

        if (opts.__cache && this._responses[url]) {
            return this._responses[url].clone();
        }

        let response = null;
        opts.__loops ??= this.loops_count;
        opts.referrer ??= '';

        while (!response && opts.__loops--) {
            try {
                response = await fetch(url, opts);
            }
            catch (error) {
                if (!opts.__loops) {
                    console.log(this.name, ':', error);

                    return;
                }

                await this.timer_fetch.sleep();
            }
        }

        if (opts.__cache) {
            this._responses[url] = response.clone();
        }

        return response;
    }
}
