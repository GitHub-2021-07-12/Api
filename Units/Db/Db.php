<?php

class Db extends Pdo {
    public $_sql_cache = [];


    public $sql_dir = '';


    static public function sql_params__create($map) {
        $params = [];

        foreach ($map as $map_key => $map_value) {
            $params[":$map_key"] = $map_value;
        }

        return $params;
    }


    public function _sql__get($sql_name) {
        if (!$this->_sql_cache[$sql_name]) {
            $this->_sql_cache[$sql_name] = file_get_contents($this->sql_dir . "/$sql_name.sql");
        }

        return $this->_sql_cache[$sql_name];
    }


    public function __construct($dsn, $opts = [], $user_name = null, $user_password = null) {
        $opts += [static::MYSQL_ATTR_LOCAL_INFILE => true];
        parent::__construct($dsn, $user_name, $user_password, $opts);

        $this->setAttribute(static::ATTR_DEFAULT_FETCH_MODE, static::FETCH_ASSOC);
        $this->setAttribute(static::ATTR_ERRMODE, static::ERRMODE_EXCEPTION);
        $this->setAttribute(static::ATTR_STRINGIFY_FETCHES, false);
    }

    public function exec_sql($sql_name) {
        return $this->exec($this->_sql__get($sql_name));
    }

    public function mySql_data__load($table_name, $fields_names, $data_file_path, $fields_delimiter = ';', $lines_delimiter = "\r\n") {
        $data_file_path = str_replace('\\', '/', realpath($data_file_path));
        $fields_names = implode(',', $fields_names);
        $query = $this->prepare("
            load data local infile '$data_file_path'
            ignore into table `$table_name`
            fields terminated by '$fields_delimiter'
            lines terminated by '$lines_delimiter'
            ($fields_names)
        ");

        return $query->execute();
    }

    public function query_sql($sql_name) {
        return $this->query($this->_sql__get($sql_name));
    }

    public function prepare_sql($sql_name) {
        return $this->prepare($this->_sql__get($sql_name));
    }
}
