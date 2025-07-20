// 🦊 FoxTools
// @Pembuat: Rubah Hitam Vukova
// @Versi: 1.7
// @Deskripsi: Membantu pelaporan vandalisme, penghapusan cepat, dan permintaan penguncian global
// @Lisensi: CC-BY-SA 4.0
// @Memerlukan_hak: Pengguna terkonfirmasi otomatis
// https://id.wikipedia.org/ 
// https://id.wikivoyage.org/ 

(function () { 
  'use strict';
  
  const Lv = 'v1.7';
  const Ln = '🦊 FoxTools';
  const FoxTools = ${Ln} ${Lv};
  const sig = '~'.repeat(4);
  
  function tampilkanMenuFoxTools() {
    const menu = document.createElement('div');
    menu.id = 'foxtools-menu';
    menu.innerHTML = `
    <div style="position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#1e1e1e;color:#e0e0e0;font-family:Segoe UI,Roboto,sans-serif;border:1px solid #444;padding:20px;border-radius:10px;z-index:9999;box-shadow:0 0 10px rgba(0,0,0,0.5);">
    <strong style="font-size:18px;"><center><big>${FoxTools}</big></center></strong><br><br>
    <button class="fox-btn" id="btn-lapor-vandalisme">🕵️ Melaporkan Vandalisme</button><br>
    <button class="fox-btn" id="btn-lapor-proksi">🖥️ Melaporkan IP Proksi Terbuka</button><br>
    <button class="fox-btn" id="btn-kpc">🗑️ Meminta Penghapusan Cepat</button><br>
    <button class="fox-btn" id="btn-mass-rollback">🔁 Pengembalian Revisi Massal</button><br><br>
    <button class="fox-btn" id="btn-close-foxtools">❌ Tutup</button><br><br>
    <strong style="font-size:18px;"><small>❤️ Dibuat oleh Rubah Hitam Vukova</small></strong>
    </div>`;
    const style = document.createElement('style');
    style.innerText = `.fox-btn { background-color: #2c2c2c; color: #e0e0e0; border: 1px solid #555; padding: 6px 12px; margin: 2px 0; font-size: 14px; border-radius: 6px; cursor: pointer; } .fox-btn:hover { background-color: #444; }`;
    document.head.appendChild(style);
    document.body.appendChild(menu);
    
    document.getElementById('btn-lapor-vandalisme').onclick = () => mw.loader.load('/w/index.php?title=Pengguna:Rubah_Hitam_Vukova/FoxTools/vandalisme.js&action=raw&ctype=text/javascript');
    document.getElementById('btn-lapor-proksi').onclick = () => mw.loader.load('/w/index.php?title=Pengguna:Rubah_Hitam_Vukova/FoxTools/proksi.js&action=raw&ctype=text/javascript');
    document.getElementById('btn-kpc').onclick = () => mw.loader.load('/w/index.php?title=Pengguna:Rubah_Hitam_Vukova/FoxTools/kpc.js&action=raw&ctype=text/javascript');
    document.getElementById('btn-mass-rollback').onclick = () => alert(`${FoxTools}\n\nFitur "Pengembalian Revisi Massal" sedang dalam pengembangan.`);
    document.getElementById('btn-close-foxtools').onclick = () => menu.remove();
  }
  
  function buatTombol() {
    if (mw.config.get('skin') !== 'minerva') return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.innerHTML = '<span class="mw-ui-icon mw-ui-icon-element">🦊</span> <b>FoxTools</b>';
    a.style.display = 'block';
    a.style.textAlign = 'center';
    a.style.padding = '10px 0';
    a.style.color = 'var(--theme-accent-color)';
    a.addEventListener('click', e => { e.preventDefault(); tampilkanMenuFoxTools(); });
    li.className = 'menu-action';
    li.appendChild(a);
    const menu = document.querySelector('.minerva-user-menu ul');
    if (menu) menu.appendChild(li);
  }
  
  mw.loader.using(['mediawiki.util', 'mediawiki.api', 'mobile.startup']).then(buatTombol);
})();
