// 06.11.2022


export class Random {
    static array(sum, count) {
        let numbers = [];

        for (let i = 0; i < count - 1; ++i) {
            numbers[i] = this.number(0, sum);
        }

        numbers.sort((a, b) => a - b);
        numbers[count - 1] = sum;

        for (let i = count - 1; i > 0; --i) {
            numbers[i] -= numbers[i - 1];
        }

        return numbers;
    }

    static item(sequence) {
        return sequence[this.number(0, sequence.length - 1)];
    }

    static number(min, max) {
        max = Math.floor(max);
        min = Math.ceil(min);

        return Math.floor(min + Math.random() * (max - min + 1));
    }

    static numbers(number_mean, count, deviation_max = number_mean) {
        let number_next = number_mean;
        let numbers = [];

        for (let i = 0, i_max = count - 1; i < i_max; i++) {
            let halfDeviation = this.number(-deviation_max, deviation_max) / 2;
            let number_rest = number_next - Math.round(number_next);

            let number = number_next + halfDeviation - number_rest;
            number_next = number_mean - halfDeviation + number_rest;

            number = Math.round(number);
            numbers.push(number);
        }

        number_next = Math.round(number_next);
        numbers.push(number_next);

        return numbers;
    }

    static terms(sum, count, deviation_max = 0.5, deviation_inPercents = true) {
        let term_mean = sum / count;
        deviation_max = deviation_max * (deviation_inPercents ? term_mean : 1);

        return this.numbers(term_mean, count, deviation_max);
    }
}
