<?php

class Auth {
  static $_db = null;
  static $_db_host = '127.0.0.1';
  static $_db_sql = [];
  static $_db_user_name = 'root';
  static $_db_user_password = 'usbw';
  // static $_db_sql_dir = './Sql';
  
  
  static $db = null;
  // static $db_path = './Auth.sqlite';
  
  
  
  
  protected function _db_sql_define() {
    foreach (glob(static::$_db_sql_dir . '/*.sql') as $path) {
      static::$_db_sql[basename($path, '.sql')] = file_get_contents($path);
    }
  }
  
  
  
  
  static function db_create() {
    
  }
  
  
  static function db_init() {
    // static::$_db = new PDO('sqlite:' . static::$db_path);
    static::_db_sql_define();
    // static::$_db->exec(static::$_db_sql['db_init']);
    
    
    // print_r(static::$_db->errorInfo());
    
    // $dsn = 'mysql:dbname=testdb;host=127.0.0.1';
    static::$_db = new PDO('mysql:host=' . static::$_db_host, static::$_db_user_name, static::$_db_user_password);
    
    static::$_db->exec('drop database `A`');
    static::$_db->exec('create database `A`');
    static::$_db->exec('use `A`');
    static::$_db->exec('create table `a` (
      a int
    )');
    
  }
}




Auth::db_init();
