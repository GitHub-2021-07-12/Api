<?php

// 13.04.2022


require_once __dir__ . '/../Json/Json.php';


class Rest {
    static public $gzip = 0;
    static public $request_method = 'POST';
    static public $timeLimit = 60;
    static public $trace = false;


    public $_data = [];
    public $_fields = [];
    public $_method = '';
    public $_method_args = [];
    public $_timeStamp = 0;


    public function _init() {}

    public function _request__parse() {
        if ($_SERVER['REQUEST_METHOD'] != static::$request_method) {
            throw new Exception('Request_method');
        }

        if (static::$request_method == 'GET') {
            $this->_method = $_GET['method'] ?? '';
            $this->_method_args = $_GET['method_args'] ?? [];
        }
        else if (static::$request_method == 'POST') {
            $request_body = file_get_contents('php://input');
            $request_data = Json::parse($request_body);

            $this->_data = $request_data['data'] ?? [];
            $this->_fields = $request_data['fields'] ?? [];
            $this->_method = $request_data['method'] ?? '';
            $this->_method_args = $request_data['method_args'] ?? [];
        }

        if (!$this->_method || str_starts_with($this->_method, '_')) {
            throw new Exception('Method');
        }
    }

    public function _run() {
        $result = null;

        try {
            $this->_request__parse();
            $this->_init();

            $result = $this->{$this->_method}(...$this->_method_args);
            $result = ['result' => $result];
        }
        catch (Error $error) {
            $result = ['error' => $error->getMessage()];

            if (static::$trace) {
                $result['trace'] = $error->getTrace();
            }
        }
        catch (Exception $exception) {
            $result = ['exception' => $exception->getMessage()];

            if (static::$trace) {
                $result['trace'] = $exception->getTrace();
            }
        }

        $result = Json::stringify($result);

        if (static::$gzip) {
            $result = gzEncode($result, static::$gzip);
            header('Content-Encoding: gzip');
        }

        echo $result;
    }

    public function _timeLimit__check() {
        return microTime(true) - $this->_timeStamp <= static::$timeLimit;
    }


    public function __construct() {
        set_time_limit(0);

        $this->_timeStamp = microTime(true);
        $this->_run();
    }
}
