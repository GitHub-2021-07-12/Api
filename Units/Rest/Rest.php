<?php

// 13.04.2022


require_once __dir__ . '/../Json/Json.php';


class Rest {
    public $_data = [];
    public $_fields = [];
    public $_method = '';
    public $_method_args = [];
    public $_timeStamp = 0;


    public $timeLimit = 60;


    public function _init() {}

    public function _request__parse() {
        $request_method = $_SERVER['REQUEST_METHOD'];

        if ($request_method == 'GET') {
            $this->_method = $_GET['method'] ?? '';
            $this->_method_args = $_GET['method_args'] ?? [];
        }
        else if ($request_method == 'POST') {
            $request_body = file_get_contents('php://input');
            $request_data = Json::parse($request_body);

            $this->_data = $request_data['data'] ?? [];
            $this->_fields = $request_data['fields'] ?? [];
            $this->_method = $request_data['method'] ?? '';
            $this->_method_args = $request_data['method_args'] ?? [];
        }
    }

    public function _run() {
        $result = null;

        try {
            if (!$this->_method || str_starts_with($this->_method, '_')) {
                throw new Error('Method');
            }

            $result = $this->{$this->_method}(...$this->_method_args);
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

    public function _timeLimit__check() {
        return microTime(true) - $this->_timeStamp <= $this->timeLimit;
    }


    public function __construct() {
        set_time_limit(0);

        $this->_timeStamp = microTime(true);
        $this->_request__parse();
        $this->_init();
        $this->_run();
    }
}
