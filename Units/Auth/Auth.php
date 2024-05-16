<?php

// 15.05.2024


require_once __dir__ . '/../Db/Db.php';


abstract class Auth {
    // public $_id = '';
    // public $_token = '';


    public $db = null;
    // public $sql__id__define = 'id__define';
    // public $sql__logIn = 'logIn';
    // public $sql__logOut = 'logOut';
    public $sql__token__add = 'token__add';
    public $sql__token__get = 'token__get';
    public $sql__user__add = 'user__add';
    public $sql__user__get = 'user__get';
    public $token_length = 32;


    public function _token__create() {
        return bin2hex(random_bytes($this->token_length));
    }


    public function id__define($token) {

    }

    public function logIn($name, $password) {
        $db_statement = $this->db->prepare_sql($this->sql__user__get);
        $db_statement->execute([':name' => $name]);
        $user = $db_statement->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) return false;

        $db_statement = $this->db->prepare_sql($this->sql__token__get);
        $db_statement->execute([':name' => $name]);
        $token = $db_statement->fetch();

        if (!$token) {
            $token = $this->_token__create();
            $db_statement = $this->db->prepare_sql($this->sql__token__add);
            $db_statement->execute([
                ':token' => $token,
                ':user_rowId' => $user['rowId'],
            ]);
        }

        return $token;
    }

    public function logOut($token) {

    }

    public function register($name, $password, $data = []) {
        $db_statement = $this->db->prepare_sql($this->sql__user__add);
        $data['name'] = $name;
        $data['password_hash'] = password_hash($password, null);
        $sql_params = $this->db->sql_parameters__create($data);
        $db_statement->execute($sql_params);

        if (!$db_statement->rowCount()) return false;

        return $this->logIn($name, $password);
    }
}
