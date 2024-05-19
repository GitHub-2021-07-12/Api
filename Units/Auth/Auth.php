<?php

// 15.05.2024


require_once __dir__ . '/../Db/Db.php';


class Auth {
    public $_id = '';


    public $db = null;
    public $name = '';
    public $password = '';
    public $sql__authRecord__add = 'authRecord__add';
    public $sql__authRecord__get = 'authRecord__get';
    public $sql__authRecord__remove = 'authRecord__remove';
    public $sql__user__add = 'user__add';
    public $sql__user__get = 'user__get';
    public $sql__user__get_by_token = 'user__get_by_token';
    public $token = '';
    public $token_length = 32;


    public function _token__create() {
        return bin2hex(random_bytes($this->token_length));
    }


    public function logIn() {
        $user = $this->db->fetch($this->sql__user__get, ['name' => $this->name])[0];

        if (!$user || !password_verify($this->password, $user['password_hash'])) return false;

        $authRecord = $this->db->fetch($this->sql__authRecord__get, ['name' => $this->name])[0];
        $token = $authRecord['token'];

        if (!$token) {
            $token = $this->_token__create();
            $data = [
                'token' => $token,
                'user_rowId' => $user['rowId'],
            ];
            $this->db->execute($this->sql__authRecord__add, $data);
        }

        return $token;
    }

    public function logOut($global = false) {
        if ($global) {
            $this->db->execute($this->sql__authRecord__remove, ['token' => $this->token]);
        }

        return true;
    }

    public function register($data = []) {
        $data['name'] = $this->name;
        $data['password_hash'] = password_hash($this->password, null);
        $statement = $this->db->execute($this->sql__user__add, $data);

        if (!$statement->rowCount()) return false;

        return $this->logIn();
    }

    public function verify() {
        $user = $this->db->fetch($this->sql__user__get_by_token, ['token' => $this->token])[0];
        $this->_id = $user['rowId'] ?: '';

        return !!$this->_id;
    }
}
