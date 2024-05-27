// 27.05.2024


export class ExternalPromise extends Promise {
    _fulfill = null;
    _reject = null;
    _resolved = false;


    constructor(executor = null) {
        if (executor) {
            super(executor);

            return;
        }

        let fulfill = null;
        let reject = null;
        executor = (...args) => [fulfill, reject] = args;
        super(executor);

        this._fulfill = fulfill;
        this._reject = reject;
    }

    fulfill(value = null) {
        this._fulfill?.(value);
        this._resolved = true;
    }

    reject(reason = null) {
        this._reject?.(reason);
        this._resolved = true;
    }
}
