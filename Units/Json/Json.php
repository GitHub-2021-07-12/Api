<?php

// 04.11.2022


class Json {
    static public function parse($string) {
        return json_decode($string, true, 512, JSON_BIGINT_AS_STRING);
    }

    static public function stringify($object) {
        return json_encode($object, JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
