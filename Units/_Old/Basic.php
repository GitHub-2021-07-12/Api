<?php

// error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
// error_reporting(0);



function curl($paths, $opts = []) {
  $cmh = curl_multi_init();
  $pathC = count($paths);
  
  $generalData = (array)$opts["generalData"];
  $generalHeaders = (array)$opts["generalHeaders"];
  
  $generalOpts = [
    CURLOPT_CONNECTTIMEOUT => 30, CURLOPT_ENCODING => "gzip", CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false, CURLOPT_USERAGENT => ""
  ];
  
  for ($i = 0; $i < $pathC; $i++) {
    $ch[$i] = curl_init($paths[$i]);
    
    ($generalData || $opts["data"][$i])
      && curl_setopt($ch[$i], CURLOPT_POSTFIELDS, (array)$opts["data"][$i] + $generalData);
    
    ($generalHeaders || $opts["headers"][$i])
      && curl_setopt($ch[$i], CURLOPT_HTTPHEADER, (array)$opts["headers"][$i] + $generalHeaders);
    
    curl_setopt_array($ch[$i], (array)$opts["opts"][$i] + $generalOpts);
    
    curl_multi_add_handle($cmh, $ch[$i]);
  }
  
  do {
    curl_multi_exec($cmh, $active);
    curl_multi_select($cmh);
    
    usleep(1e3);
  }
  while ($active > 0);
  
  for ($i = 0; $i < $pathC; $i++) {
    $results[$i] = curl_multi_getcontent($ch[$i]);
    
    curl_multi_remove_handle($cmh, $ch[$i]);
    curl_close($ch[$i]);
  }
  
  curl_multi_close($cmh);
  
  return $results;
}

function curl_multi($urls, $opt_sets = [], $ch_c = 1) {
  $general_opts = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false
  ];
  
  $url_c = count($urls);
  $opt_set_c = count($opt_sets);
  $ch_c = max($ch_c, count($urls), count($opt_sets));
  
  $cmh = curl_multi_init();
  
  for ($i = 0; $i < $ch_c; $i++) {
    $ch[$i] = curl_init($urls[$i] ?? $urls[$url_c - 1]);
    
    curl_setopt_array($ch[$i], (array)($opt_sets[$i] ?? $opt_sets[$opt_set_c - 1]) + $general_opts);
    
    curl_multi_add_handle($cmh, $ch[$i]);
  }
  
  do {
    curl_multi_exec($cmh, $active);
    curl_multi_select($cmh);
    
    usleep(1e3);
  }
  while ($active > 0);
  
  for ($i = 0; $i < $ch_c; $i++) {
    $results[$i] = curl_multi_getcontent($ch[$i]);
    
    curl_multi_remove_handle($cmh, $ch[$i]);
    curl_close($ch[$i]);
  }
  
  curl_multi_close($cmh);
  
  return $results;
}

function jsonDecode($str) {
  return json_decode($str, true);
}

function jsonEncode($obj) {
  return json_encode($obj, JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function toRange($value, $min, $max) {
  return $value < $min ? $min : ($value > $max ? $max : $value);
}



class DB extends PDO {
  static public $dbName = "db";
  static public $host = "localhost";
  static public $userName = "root";
  static public $userPassword = "";
  
  public function __construct($dbName = null, $host = null, $userName = null, $userPassword = null) {
    $dbName = $dbName ?? static::$dbName;
    $host = $host ?? static::$host;
    $userName = $userName ?? static::$userName;
    $userPassword = $userPassword ?? static::$userPassword;
    
    parent::__construct(
      "mysql: host=$host; dbname=$dbName; charset=utf8", $userName, $userPassword, [static::ATTR_PERSISTENT => true]
    );
    
    $this->setAttribute(static::ATTR_DEFAULT_FETCH_MODE, static::FETCH_ASSOC);
    $this->setAttribute(static::ATTR_ERRMODE, static::ERRMODE_EXCEPTION);
    $this->setAttribute(static::ATTR_STRINGIFY_FETCHES, false);
    
    return $this;
  }
}





?>
