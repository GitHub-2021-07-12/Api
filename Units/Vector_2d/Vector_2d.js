// 29.01.2023


import {Common} from '../Common/Common.js';


export class Vector_2d {
    x = 0;
    y = 0;


    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    set length(value) {
        if (this.is_zero()) return;

        let coeff = value / this.length;

        this.x *= coeff;
        this.y *= coeff;
    }


    clone() {
        return new this.constructor(this.x, this.y);
    }

    constructor(x = 0, y = x) {
        this.set(x, y);
    }

    cos__get(vector) {
        return this.prod_scalar(vector) / (this.length * vector.length);
    }

    divide(num) {
        this.x /= num;
        this.y /= num;

        return this;
    }

    invert() {
        this.x = -this.x;
        this.y = -this.y;

        return this;
    }

    is_zero() {
        return !this.x && !this.y;
    }

    length__set(value) {
        this.length = value;

        return this;
    }

    length__to_range(length_min, length_max) {
        this.length = Common.to_range(this.length, length_min, length_max);

        return this;
    }

    norm() {
        this.length = 1;

        return this;
    }

    prod(num) {
        this.x *= num;
        this.y *= num;

        return this;
    }

    prod_scalar(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    set(x, y = x) {
        this.x = x;
        this.y = y;

        return this;
    }

    set_vector(vector) {
        this.x = vector.x;
        this.y = vector.y;

        return this;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    sum(vector) {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    to_range(vector_min, vector_max) {
        this.x = Common.to_range(this.x, vector_min.x, vector_max.x);
        this.y = Common.to_range(this.y, vector_min.y, vector_max.y);

        return this;
    }

    x__to_range(x_min, x_max) {
        this.x = Common.to_range(this.x, x_min, x_max);

        return this;
    }

    y__to_range(y_min, y_max) {
        this.y = Common.to_range(this.y, y_min, y_max);

        return this;
    }
}
