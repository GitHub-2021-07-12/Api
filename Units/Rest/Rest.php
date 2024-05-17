<?php

// 13.04.2022


require_once __dir__ . '/../Json/Json.php';


class Rest {
    public $_args = [];
    public $_data = null;
    public $_method = '';
    public $_timestamp = null;


    public $object = null;


    public function _request__parse() {
        $request_method = $_SERVER['REQUEST_METHOD'];

        if ($request_method == 'GET') {
            $this->_args = $_GET['args'];
            $this->_method = $_GET['method'];
        }
        else if ($request_method == 'POST') {
            $request_body = file_get_contents('php://input');
            $request_data = Json::parse($request_body);
            $this->_args = $request_data['args'];
            $this->_data = $request_data['data'];
            $this->_method = $request_data['method'];
        }

        $this->_args ??= [];
    }


    public function __construct() {
        $this->_timestamp = microTime(true);
        $this->object = $this;
    }

    public function run() {
        $result = null;

        try {
            $this->_request__parse();

            if (str_starts_with($this->_method, '_')) {
                throw new Error('Method');
            }

            $result = $this->object->{$this->_method}(...$this->_args);
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
