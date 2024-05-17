// 13.04.2022


export class Rest {
    data__get = () => null;
    url = '';


    async call(method, ...args) {
        let result = null;

        try {
            let request_data = {args, method};

            let data = this.data__get();

            if (data) {
                request_data.data = data;
            }

            let fetch_opts = {
                body: JSON.stringify(request_data),
                method: 'post',
            };
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
