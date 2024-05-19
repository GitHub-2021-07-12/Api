// 13.04.2022


export class Rest {
    url = '';


    _request_data__create(method, ...method_args) {
        let request_data = {};

        let data = this.data__create();

        if (data) {
            request_data.data = data;
        }

        request_data.method = method;

        if (method_args.length) {
            request_data.method_args = method_args;
        }

        return request_data;
    }


    data__create() {}

    async call(method, ...method_args) {
        let fetch_opts = {
            body: JSON.stringify(this._request_data__create(method, ...method_args)),
            method: 'post',
        };
        let result = null;

        try {
            let response = await fetch(this.url, fetch_opts);
            result = await response.json();
        }
        catch (error) {
            result = {error};
        }

        return result;
    }

    constructor(url = '') {
        this.url = url;
    }
}
