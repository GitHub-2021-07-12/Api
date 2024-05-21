<?php

// 07.07.2022


class Http {
    static public $_fetch_cache = [];
    static public $_fetch_delay_max = 5;
    static public $_fetch_delay_min = 1;


    static function _fetch_opts__proc($fetch_opts) {
        $fetch_opts_processed = [
            CURLOPT_HEADER => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
        ];

        if ($fetch_opts['body']) {
            $fetch_opts_processed[CURLOPT_POSTFIELDS] = $fetch_opts['body'];
        }

        if (is_array($fetch_opts['headers'])) {
            $f = fn ($key, $value) => "$key: $value";
            $fetch_opts_processed[CURLOPT_HTTPHEADER] = array_map($f, array_keys($fetch_opts['headers']), array_values($fetch_opts['headers']));
        }

        if ($fetch_opts['method']) {
            $fetch_opts_processed[CURLOPT_CUSTOMREQUEST] = mb_strToUpper($fetch_opts['method']);
        }

        return $fetch_opts_processed;
    }

    static function _fetch_response__proc($response_raw) {
        $response_raw_parts = explode("\r\n\r\n", $response_raw, 2);
        $response_headers_strings = explode("\r\n", $response_raw_parts[0]);

        $response_status_string = array_shift($response_headers_strings);
        $response_status = explode(' ', $response_status_string)[1];

        $response_headers = [];

        forEach ($response_headers_strings as $response_header_string) {
            $response_header_string_parts = explode(': ', $response_header_string, 2);
            $response_headers[mb_strToLower($response_header_string_parts[0])] = $response_header_string_parts[1];
        }

        $response = [
            'body' => $response_raw_parts[1],
            'headers' => $response_headers,
            'status' => $response_status,
        ];

        return $response;
    }


    static function fetch($url, $opts = []) {
        if ($opts['__cache'] && static::$_fetch_cache[$url]) {
            return static::$_fetch_cache[$url];
        }

        $curl_handle = curl_init($url);
        $opts_processed = static::_fetch_opts__proc($opts);
        curl_setopt_array($curl_handle, $opts_processed);

        $opts['__loops'] ??= PHP_INT_MAX;
        $response_raw = null;

        while (!$response_raw && $opts['__loops']--) {
            try {
                $response_raw = curl_exec($curl_handle);
            }
            catch (Error $error) {
                if (!$opts['__loops']) throw $error;

                sleep(rand(static::$_fetch_delay_min, static::$_fetch_delay_max));
            }
        }

        $response = static::_fetch_response__proc($response_raw);

        if ($opts['__cache']) {
            static::$_fetch_cache[$url] = $response;
        }

        return $response;
    }
}
