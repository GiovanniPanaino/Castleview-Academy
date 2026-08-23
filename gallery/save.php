<?php
// /gallery/save.php  — list images in a folder (used by gallery.js)
header('Content-Type: application/json');

// Require both flags
if (!isset($_GET['list']) || !isset($_GET['path'])) { echo json_encode([]); exit; }

$requested = $_GET['path'] ?? '';           // e.g. /Images or /gallery/albums/xyz

// Resolve site root as the parent of /gallery/
$siteRoot    = realpath(__DIR__ . '/..');   // ...\CPAv15
$absRequested= realpath($siteRoot . $requested);

// Whitelisted roots
$rootAlbums  = realpath(__DIR__ . '/albums');        // ...\CPAv15\gallery\albums
$rootImages  = realpath($siteRoot . '/Images');      // ...\CPAv15\Images

// Only allow if requested path is inside /gallery/albums OR /Images
$allowed = false;
foreach ([$rootAlbums, $rootImages] as $root) {
  if ($root && $absRequested && strpos($absRequested, $root) === 0) { $allowed = true; break; }
}
if (!$allowed) { echo json_encode([]); exit; }

// Collect images
$files = glob($absRequested . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);
natsort($files);

// Build web paths relative to site root; normalize slashes
$out = [];
foreach ($files as $f) {
  $rel = substr($f, strlen($siteRoot));     // remove ...\CPAv15
  $rel = str_replace('\\', '/', $rel);      // ensure / not \
  // Skip common cover/thumb folders if you add them later
  if (preg_match('~/(thumbs|covers?)/~i', $rel) || preg_match('~/cover\.webp$~i', $rel)) continue;
  $out[] = $rel;
}

echo json_encode(array_values($out));
