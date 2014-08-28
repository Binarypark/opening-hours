<?php
    
  if (isset($_GET["email"])) {
    $from = $_GET["email"]; // sender
    $name = $_GET["name"];
    $message = $_GET["message"];
    // message lines should not exceed 70 characters (PHP rule), so wrap it
    $message = wordwrap($message, 170);
    // send mail
    mail("cpaun88@gmail.com",$name,$message,"From: $from\n");
    echo "Thank you for sending us feedback";
  }

?>