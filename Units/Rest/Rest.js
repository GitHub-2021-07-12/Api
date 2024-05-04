// 13.04.2022


export class Rest {
    url = '';


    async call(method, ...args) {
        let result = null;

        try {
            let fetch_opts = {
                body: JSON.stringify({args, method}),
                method: 'post',
            };
            let response = await fetch(this.url, fetch_opts);
            result = await response.json();
        }
        catch (error) {
            result = {error: true};
        }

        return result;
    }

    constructor(url) {
        this.url = url;
    }
}
