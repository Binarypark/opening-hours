<?php
    
  if (isset($_POST["email"])) {
    $from = $_POST["email"]; // sender
    $name = $_POST["name"];
    $message = $_POST["message"];
    // message lines should not exceed 70 characters (PHP rule), so wrap it
    $message = wordwrap($message, 70);
    // send mail
    mail("cpaun88@gmail.com",$name,$message,"From: $from\n");
    echo "Thank you for sending us feedback";
  }

?>