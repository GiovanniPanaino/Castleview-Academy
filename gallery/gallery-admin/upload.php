<?php
session_start(); if(empty($_SESSION['auth'])) { header('Location: login.php'); exit; }
$albumsJson = realpath(__DIR__ . '/../gallery/data') . '/albums.json';
$albums = file_exists($albumsJson) ? json_decode(file_get_contents($albumsJson), true) : [];
function resp($ok,$msg,$data=null){ header('Content-Type: application/json'); echo json_encode(['ok'=>$ok,'msg'=>$msg,'data'=>$data]); exit; }

if($_SERVER['REQUEST_METHOD']==='POST' && isset($_GET['api']) && $_GET['api']==='upload'){
  $albumId = preg_replace('~[^a-z0-9\-]~','-', strtolower($_POST['album'] ?? ''));
  if(!$albumId) resp(false,'Album name required');

  $albumPath = __DIR__ . '/../gallery/albums/' . $albumId;
  $thumbPath = __DIR__ . '/../gallery/thumbs/' . $albumId;
  @mkdir($albumPath,0775,true); @mkdir($thumbPath,0775,true);

  if(empty($_FILES['files'])) resp(false,'No files');
  $added = 0; $coverSet = false;

  foreach($_FILES['files']['tmp_name'] as $i=>$tmp){
    $name = basename($_FILES['files']['name'][$i]);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if(!in_array($ext, ['jpg','jpeg','png','webp'])) continue;

    $safe = uniqid('img_').'.'.$ext;
    $dest = $albumPath.'/'.$safe;
    if(!move_uploaded_file($tmp, $dest)) continue;

    $webp = preg_replace('~\.(jpe?g|png|webp)$~i','.webp',$dest);
    to_webp($dest, $webp);
    $thumb = $thumbPath.'/'.basename($webp);
    make_thumb($webp, $thumb, 600);

    if(!$coverSet && !file_exists($thumbPath.'/cover.webp')){
      @copy($thumb, $thumbPath.'/cover.webp');
      $coverSet = true;
    }
    $added++;
  }

  // update albums.json
  $exists = false;
  foreach($albums as &$a){
    if($a['id']===$albumId){
      $a['count'] = ($a['count'] ?? 0) + $added;
      $a['cover'] = $a['cover'] ?? "/gallery/thumbs/$albumId/cover.webp";
      $exists = true; break;
    }
  }
  if(!$exists){
    $title = trim($_POST['title'] ?? '');
    $albums[] = [
      'id'=>$albumId,
      'title'=> $title ?: ucwords(str_replace('-',' ',$albumId)),
      'cover'=>"/gallery/thumbs/$albumId/cover.webp",
      'count'=>$added,
      'path'=>"/gallery/albums/$albumId"
    ];
  }
  file_put_contents($albumsJson, json_encode($albums, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
  resp(true,"Uploaded $added file(s).",['album'=>$albumId]);
}

function to_webp($src,$dest){
  $ext = strtolower(pathinfo($src, PATHINFO_EXTENSION));
  if($ext==='webp'){ @copy($src,$dest); return; }
  if(in_array($ext,['jpg','jpeg'])) $im = @imagecreatefromjpeg($src);
  elseif($ext==='png') $im = @imagecreatefrompng($src);
  else return;
  if(!$im) return;
  @imagepalettetotruecolor($im);
  @imagewebp($im, $dest, 82);
  @imagedestroy($im);
}
function make_thumb($src,$dest,$max){
  $im = @imagecreatefromwebp($src); if(!$im) return;
  $w = imagesx($im); $h = imagesy($im);
  $scale = $max / max($w,$h);
  $nw = max(1,(int)round($w*$scale)); $nh = max(1,(int)round($h*$scale));
  $out = imagecreatetruecolor($nw,$nh);
  imagecopyresampled($out,$im,0,0,0,0,$nw,$nh,$w,$h);
  imagewebp($out,$dest,80);
  imagedestroy($im); imagedestroy($out);
}
?>
<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="admin.css">
<title>Upload Photos</title>
<header class="bar">
  <h1>Gallery Uploader</h1>
  <nav><a href="logout.php">Log out</a></nav>
</header>
<main class="wrap">
  <form id="upForm">
    <label>Album ID / new name
      <input name="album" placeholder="e.g. sports-day-2025" required>
    </label>
    <label>Album Title (if new)
      <input name="title" placeholder="Sports Day 2025">
    </label>
    <div id="drop" class="drop">Drop images here or click to select</div>
    <input id="fileInput" type="file" name="files[]" accept="image/*" multiple hidden>
    <button type="submit">Upload</button>
    <p id="status"></p>
  </form>
</main>
<script>
const drop = document.getElementById('drop');
const fileInput = document.getElementById('fileInput');
const form = document.getElementById('upForm');
const statusEl = document.getElementById('status');

drop.addEventListener('click', ()=>fileInput.click());
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault(); drop.classList.add('on');}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault(); drop.classList.remove('on');}));
drop.addEventListener('drop', e=>{ fileInput.files = e.dataTransfer.files; });

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const fd = new FormData(form);
  for(const f of fileInput.files) fd.append('files[]', f);
  statusEl.textContent = 'Uploading...';
  const res = await fetch('upload.php?api=upload', { method:'POST', body:fd });
  const j = await res.json().catch(()=>({ok:false,msg:'Server error'}));
  statusEl.textContent = j.ok ? j.msg : ('Error: ' + j.msg);
});
</script>
