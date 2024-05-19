<?php

// 13.04.2022


require_once __dir__ . '/../Json/Json.php';


class Rest {
    static public $_data = [];
    static public $_fields = [];
    static public $_method = '';
    static public $_method_args = [];


    static public function _init() {}

    static public function _request__parse() {
        $request_method = $_SERVER['REQUEST_METHOD'];

        if ($request_method == 'GET') {
            static::$_method = $_GET['method'] ?? '';
            static::$_method_args = $_GET['method_args'] ?? [];
        }
        else if ($request_method == 'POST') {
            $request_body = file_get_contents('php://input');
            $request_data = Json::parse($request_body);

            static::$_data = $request_data['data'] ?? [];
            static::$_fields = $request_data['fields'] ?? [];
            static::$_method = $request_data['method'] ?? '';
            static::$_method_args = $request_data['method_args'] ?? [];
        }
    }


    static public function run() {
        static::_request__parse();
        static::_init();

        $result = null;

        try {
            if (!static::$_method || str_starts_with(static::$_method, '_')) {
                throw new Error('Method');
            }

            $result = static::{static::$_method}(...static::$_method_args);
            $result = ['result' => $result];
        }
        catch (Error $error) {
            $result = [
                'error' => $error->getMessage(),
                'trace' => $error->getTrace(),
            ];
        }
        catch (Exception $exception) {
            $result = [
                'exception' => $exception->getMessage(),
                'trace' => $exception->getTrace(),
            ];
        }

        echo Json::stringify($result);
    }
}
