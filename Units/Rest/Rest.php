<?php

// 13.04.2022


require_once __dir__ . '/../Json/Json.php';


class Rest {
    public $_method_args = [];
    public $_method_name = '';
    public $_timestamp = null;


    public $object = null;


    public function _request__parse() {
        $request_method = $_SERVER['REQUEST_METHOD'];

        if ($request_method == 'GET') {
            $this->_method_args = $_GET['args'];
            $this->_method_name = $_GET['method'];
        }
        else if ($request_method == 'POST') {
            $request_body = file_get_contents('php://input');
            $request_data = Json::parse($request_body);
            $this->_method_args = $request_data['args'];
            $this->_method_name = $request_data['method'];
        }

        $this->_method_args ??= [];
    }


    public function __construct() {
        $this->_timestamp = microTime(true);
        $this->object = $this;
    }

    public function run() {
        $result = null;

        try {
            $this->_request__parse();

            $reflectionMethod = new ReflectionMethod($this->object, $this->_method_name);

            if (!$reflectionMethod->isFinal()) {
                throw new Error('Method');
            }

            $result = $this->object->{$this->_method_name}(...$this->_method_args);
            $result = ['result' => $result];
        }
        catch (Error $error) {
            $result = [
                'error' => $error->getMessage(),
                'trace' => $error->getTraceAsString(),
            ];
        }
        catch (Exception $exception) {
            $result = [
                'exception' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        echo Json::stringify($result);
    }
}
