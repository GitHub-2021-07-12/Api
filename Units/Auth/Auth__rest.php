<?php

require_once __dir__ . '/../Rest/Rest.php';

require_once __dir__ . '/Auth.php';


$rest = new Rest();
$rest->object = new Auth();
$rest->run();
