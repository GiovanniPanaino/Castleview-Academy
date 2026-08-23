<?php
session_start();
const USER="giovanni";          // change
const PASS="StrongPass#2025";   // change
if ($_SERVER['REQUEST_METHOD']==='POST') {
  if (($_POST['u'] ?? '')===USER && ($_POST['p'] ?? '')===PASS) {
    $_SESSION['auth']=true; header('Location: upload.php'); exit;
  }
  $err = "Invalid credentials";
}
?>
<!doctype html><meta charset="utf-8">
<title>Gallery Login</title>
<link rel="stylesheet" href="admin.css">
<form method="post" class="card">
  <h2>Gallery Admin</h2>
  <?php if(!empty($err)) echo "<p class=err>$err</p>"; ?>
  <label>Username <input name="u" required></label>
  <label>Password <input type="password" name="p" required></label>
  <button>Sign in</button>
</form>
