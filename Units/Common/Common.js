// 06.11.2022


export class Common {
    static execute(js, args = {}) {
        try {
            return new Function(Object.keys(args), js)(...Object.values(args));
        }
        catch {}

        return null;
    }

    static execute_expression(js_expression, args = {}) {
        return this.execute(`return (${js_expression});`, args);
    }

    static extract(object, path) {
        let aim = object;
        let props = path.split('.');

        for (let prop of props) {
            if (!(aim instanceof Object)) return undefined;

            aim = aim[prop];
        }

        return aim;
    }

    static in_range(value, value_min, value_max) {
        return value >= value_min && value <= value_max;
    }

    static in_range_strict(value, value_min, value_max) {
        return value > value_min && value < value_max;
    }

    static to_range(value, value_min, value_max) {
        return value < value_min ? value_min : (value > value_max ? value_max : value);
    }

    static to_ring(num, num_min, num_max) {
        let base = Math.max(num_min, num_max) - num_min + 1;

        return (base + (num - num_min) % base) % base + num_min;
    }
}
