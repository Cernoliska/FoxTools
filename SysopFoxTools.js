/**
 * +------------------------------------------------------------------------------+
 * |      === ⚠️ PERHATIAN ⚠️ ===                                                 |
 * |      Mengubah halaman ini dapat mempengaruhi banyak pengguna.                |
 * |      Harap diskusi di [[Pembicaraan Wikipedia:FoxTools]] sebelum menyunting. |
 * +------------------------------------------------------------------------------+
 *
 * This is Vukova's Sysop FoxTools, anti-vandalism mobile script for Administrators.
 * Visit [[WP:SFT]] for more information.
 */

// <nowiki>

(function () {
  
  if (mw.config.get('skin') !== 'minerva') return;

  const menu = document.querySelector('.minerva-user-menu ul');
  if (!menu) return;

  const api = new mw.Api();
  const ns = mw.config.get('wgNamespaceNumber');
  const pageName = mw.config.get('wgPageName');
  const canonicalSpecial = mw.config.get('wgCanonicalSpecialPageName');
  const relevantUser = mw.config.get('wgRelevantUserName');
  const isSpecial = !!canonicalSpecial;
  const isUserCtx = (ns === 2 || ns === 3) && !!relevantUser; // User / User talk
  const isContribs = canonicalSpecial === 'Contributions' && !!relevantUser;

  (function injectStyle() {
    if (document.getElementById('fox-panel-style')) return;
    const style = document.createElement('style');
    style.id = 'fox-panel-style';
    style.textContent = `
    #fox-panel {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      max-width: 560px; width: 92%;
      background: #111; color: #0f0;
      border: 2px solid #0f0; padding: 1em;
      font-family: monospace; z-index: 9999;
      box-shadow: 0 0 10px #0f0; text-shadow: 0 0 5px #0f0;
    }
    
    #fox-panel-ii {
      max-width: 560px; width: 92%;
      background: #111; color: #0f0;
      border: 2px solid #0f0; padding: 1em;
      font-family: monospace; z-index: 9999;
      box-shadow: 0 0 10px #0f0; text-shadow: 0 0 5px #0f0;
    }
    
    #fox-panel button:hover { background: #0f0; color: #000; }
    .fox-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .fox-card { flex: 1 1 240px; border: 1px dashed #0f0; padding: 10px; border-radius: 8px; }
    .fox-muted { opacity: .65; }
    .fox-inline { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .fox-badge { display: inline-block; padding: 0 6px; border: 1px solid #0f0; border-radius: 999px; margin-left: 6px; }
    
    #fox-panel-ii button:hover { background: #0f0; color: #000; }
    .fox-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .fox-card { flex: 1 1 240px; border: 1px dashed #0f0; padding: 10px; border-radius: 8px; }
    .fox-muted { opacity: .65; }
    .fox-inline { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .fox-badge { display: inline-block; padding: 0 6px; border: 1px solid #0f0; border-radius: 999px; margin-left: 6px; }
    
    #fox-panel input,
    #fox-panel select,
    #fox-panel button {
    background: #000;
    color: #0f0;
    border: 1px solid #0f0;
    font-family: monospace;
    margin-top: 4px;
    margin-bottom: 10px;
    box-shadow: 0 0 5px #0f0;
    text-shadow: 0 0 3px #0f0;
    }
    
    #fox-panel-ii button {
    background: #000;
    color: #0f0;
    border: 1px solid #0f0;
    font-family: monospace;
    margin-top: 4px;
    margin-bottom: 10px;
    box-shadow: 0 0 5px #0f0;
    text-shadow: 0 0 3px #0f0;
    }
    
    #fox-panel button {
    cursor: pointer;
    padding: 4px 8px;
    }
    
    #fox-panel-ii button {
    cursor: pointer;
    padding: 4px 8px;
    }
    
    #fox-close {
    background: #111;
    color: #0f0;
    border: none;
    font-weight: bold;
    cursor: pointer;
    }
    
    #fox-close:hover {
    color: #fff;
    background: #900;
    }
    `;
    document.head.appendChild(style);
  })();
  
  const SysopFoxTools = '[[WP:FT|🦊 Sysop FoxTools]]';
  const sig = '~'.repeat(4);

  function buatTombol(label, onclick) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    a.style.display = 'block';
    a.style.textAlign = 'center';
    a.style.padding = '10px 0';
    a.style.color = 'var(--theme-accent-color)';
    a.addEventListener('click', e => { e.preventDefault(); onclick(); });
    li.className = 'menu-action';
    li.appendChild(a);
    menu.appendChild(li);
  }

  function bukaPanel() {
    let panel = document.getElementById('fox-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'fox-panel';
      panel.innerHTML = `
        <div class="fox-inline">
          <big><strong>🦊 Sysop FoxTools 🧹</strong></big>
          <button id="fox-close">X</button>
        </div>
        <small>❤️ Dibuat dengan cinta oleh Rubah Hitam Vukova</small>
        <div id="fox-content" style="margin-top:1em"></div>
      `;
      document.body.appendChild(panel);
      document.getElementById('fox-close').onclick = () => (panel.style.display = 'none');
    } else {
      panel.style.display = 'block';
    }
    return panel;
  }

  function notiOK(msg){ mw.notify ? mw.notify(msg, { type: 'success' }) : alert(msg); }
  function notiERR(msg){ mw.notify ? mw.notify(msg, { type: 'error' }) : alert('❌ ' + msg); }
  function notiWARN(msg){ mw.notify ? mw.notify(msg, { type: 'warn' }) : alert('⚠️ ' + msg); }

  function panelBlokir() {
    const panel = bukaPanel();
    const userGuess =
      relevantUser ||
      (isContribs ? (mw.util.getParamValue('target') || '').replace(/\s/g, '_') : '');

    const bisaBlokir = (isUserCtx || isContribs) && !!(relevantUser || userGuess);

    document.getElementById('fox-content').innerHTML = `
      <div class="fox-card ${bisaBlokir ? '' : 'fox-muted'}">
        <div class="fox-inline">
          <b>🔨 Blokir Akun Pengguna – Sysop FoxTools</b>
          <span class="fox-badge">${bisaBlokir ? '🟢 Tersedia' : '🔴 Tidak tersedia'}</span>
        </div>
        <br>
        <label>• Nama Pengguna:</label>
        <input id="fox-bl-user" type="text" value="${bisaBlokir ? (relevantUser || userGuess) : ''}" placeholder="Nama pengguna">
        <br>
        <label>• Durasi:</label>
        <select id="fox-bl-expiry">
          <option value="12 hours" selected>12 jam</option>
          <option value="1 day">1 hari</option>
          <option value="3 days">3 hari</option>
          <option value="1 week">1 minggu</option>
          <option value="2 week">2 minggu</option>
          <option value="1 month">1 bulan</option>
          <option value="3 month">3 bulan</option>
          <option value="6 month">6 bulan</option>
          <option value="1 year">1 tahun</option>
          <option value="2 year">2 tahun</option>
          <option value="3 year">3 tahun</option>
          <option value="4 year">4 tahun</option>
          <option value="5 year">5 tahun</option>
          <option value="infinite">Tak terbatas</option>
        </select>
        <br>
        <label>• Alasan:</label>
        <select id="fox-bl-reason">
          <option value="Menyunting secara terus-menerus tentang informasi yang tidak memiliki referensi, referensi yang buruk atau salah, atau berpotensi memfitnah tentang [[Wikipedia:Biografi tokoh yang masih hidup|orang yang masih hidup]]" selected>Menyunting tanpa referensi / hoax</option>
          <option value="Akun yang tampaknya telah disusupi/digunakan oleh orang lain selain orang yang mendaftarkan akun tersebut">Akun yang disusupi / digunakan oleh orang lain</option>
          <option value="Melakukan [[Wikipedia:Vandalisme|vandalisme]], atau akun yang hanya digunakan untuk tujuan vandalisme">Vandalisme</option>
          <option value="Melakukan [[Wikipedia:Etikawiki|tindakan yang tidak sopan dan kasar]]">Tindakan tidak sopan dan kasar</option>
          <option value="Melakukan perang suntingan, terutama melanggar [[Wikipedia:Tiga kali pengembalian|tiga kali pengembalian]]">Perang suntingan</option>
          <option value="Memasukkan [[Wikipedia:Spam|spam]] untuk mempromosikan seseorang, perusahaan, produk, layanan, atau organisasi, atau akun yang terlihat berdasarkan riwayat penyuntingan mereka dibuat dengan tujuan utama atau satu-satunya untuk mempromosikan seseorang, perusahaan, produk, layanan, atau organisasi">Spam / bot spam</option>
          <option value="[[Wikipedia:Spam|Spam pranala judol]], atau usaha [[WP:IKLAN|mempromosikan]] situs judi online">Spam JUDI</option>
          <option value="Akun yang dengan sengaja melewati filter penyuntingan">Sengaja melewati filter penyalahgunaan</option>
          <option value="Akun yang secara jelas tidak beritikad baik untuk membangun sebuah ensiklopedia">Tidak beritikad baik membangun ensiklopedia</option>
          <option value="Akun dengan [[Wikipedia:Nama pengguna#Nama pengguna yang dilarang|nama pengguna yang dilarang]]">Nama pengguna terlarang</option>
          <option value="Akun bot yang beroperasi di luar kendali operatornya, atau yang tampaknya tidak berfungsi">Bot yang diluar kendali</option>
          <option value="[[Wikipedia:Proksi terbuka|Proksi terbuka]]: lihat [[m:WikiProject on open proxies/Help:blocked/id|halaman ini]] apabila terdampak">Proksi terbuka (khusus alamat IP / rentang IP)</option>
          <option value="Pelanggaran keamanan: melakukan [[Wikipedia:Kebijakan keamanan penyuntingan#Pelecehan|pelecehan]]">Pelecehan</option>
          <option value="Pelanggaran keamanan: [[Wikipedia:Kebijakan keamanan penyuntingan#Fitnah terhadap pengguna lain|memfitnah pengguna lain]]">Memfitnah pengguna lain</option>
          <option value="Pelanggaran keamanan: [[Wikipedia:Kebijakan keamanan penyuntingan#Pembeberan informasi|membeberkan informasi orang lain tanpa persetujuan]]">Doxxing</option>
          <option value="Pelanggaran keamanan:  melakukan [[Wikipedia:Kebijakan keamanan penyuntingan#Pengancaman|pengancaman]]">Pengancaman</option>
          <option value="Pelanggaran keamanan: melakukan [[Wikipedia:Kebijakan keamanan penyuntingan#Penyerangan|penyerangan]]">Penyerangan</option>
          <option value="Pengguna siluman: [[Wikipedia:Pengguna siluman#Jenis-jenis pengguna siluman yang dilarang|menyalahgunakan beberapa akun]]">Menyalahgunakan beberapa akun</option>
          <option value="Hak cipta: [[Wikipedia:Pelanggaran hak cipta|melakukan pelanggaran hak cipta]]">Melanggar hak cipta</option>
          <option value="Kontribusi bayaran: [[Wikipedia:Memberitahukan kontribusi yang dibayar|tidak memberitahukan kontribusi yang dibayar]]">Kontribusi bayaran</option>
        </select>
        <br>
        <label>• Alasan Lainnya (Opsional):</label>
        <input id="fox-bl-other" type="text">
        <br>
        <input id="fox-bl-autoblock" type="checkbox" checked> Blokir IP Yang Terakhir Dipakai</label>
        <br>
        <input id="fox-bl-nocreate" type="checkbox" checked> Pembuatan Akun Dimatikan</label>
        <br>
        <input id="fox-bl-nousertalk"  type="checkbox"> Halaman Pembicaraan Dimatikan</label>
        <br>
        <input id="fox-bl-noemail"  type="checkbox"> Surel Diblokir</label>
        <br>
        <input id="fox-bl-talknote" type="checkbox" checked> Beritahu Pengguna (Pemblokiran Sementara)</label>
        <br>
        <input id="fox-bl-talknoteindef" type="checkbox"> Beritahu Pengguna (Pemblokiran Selamanya)</label>
        <br>
        <br>
        <button id="fox-bl-submit" ${bisaBlokir ? '' : 'disabled'}>Terapkan</button>
      </div>
    `;

    const btn = document.getElementById('fox-bl-submit');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const user = (document.getElementById('fox-bl-user').value || '').trim();
      const expiry = document.getElementById('fox-bl-expiry').value;
      const reasonSelect = document.getElementById('fox-bl-reason');
      const reasonOther  = document.getElementById('fox-bl-other');
      let reason = reasonSelect.value + ` (${SysopFoxTools})`;
      if (reasonOther && reasonOther.value.trim() !== '') {
      	reason += ': ' + reasonOther.value.trim();
      }
      const autoblock = document.getElementById('fox-bl-autoblock').checked ? 1 : undefined;
      const nocreate = document.getElementById('fox-bl-nocreate').checked ? 1 : undefined;
      const nousertalk  = document.getElementById('fox-bl-nousertalk').checked  ? 1 : undefined;
      const noemail  = document.getElementById('fox-bl-noemail').checked  ? 1 : undefined;
      const talknote = document.getElementById('fox-bl-talknote').checked;
      const talknoteindef = document.getElementById('fox-bl-talknoteindef').checked;
      
      if (!user) return notiWARN('Nama pengguna tidak boleh kosong.');
      try {
      	const payload = {
      		action: 'block',
      		user,
      		expiry,
      		reason,
      		tags: 'FoxTools'
      	};
      	if (document.getElementById('fox-bl-autoblock').checked) payload.autoblock = true;
      	if (document.getElementById('fox-bl-nocreate').checked) payload.nocreate = true;
      	if (document.getElementById('fox-bl-nousertalk').checked) payload.nousertalk = true;
      	if (document.getElementById('fox-bl-noemail').checked) payload.noemail = true;
      	await api.postWithToken('block', payload);
        notiOK(`🟢 ${user} berhasil diblokir.`);
       
        if (talknote) {
          await api.postWithEditToken({
            action: 'edit',
            title: 'User talk:' + user,
            section: 'new',
            summary: `Pemberitahuan pemblokiran sementara`,
            text: `{{uw-block}} ${sig}`,
            tags: 'FoxTools'
          });
          notiOK('🟢 Pemberitahuan pemblokiran berhasil ditambahkan.');
        }
        
        if (talknoteindef) {
          await api.postWithEditToken({
            action: 'edit',
            title: 'User talk:' + user,
            section: 'new',
            summary: `Pemberitahuan pemblokiran selamanya`,
            text: `{{uw-blockindef}} ${sig}`,
            tags: 'FoxTools'
          });
          notiOK('🟢 Pemberitahuan pemblokiran berhasil ditambahkan.');
        }
        document.getElementById('fox-panel').style.display = 'none';
      } catch (e) {
        notiERR(e?.error?.info || e);
      }
    });
  }

  function panelHapus() {
    const panel = bukaPanel();
    const bisaHapus = !isSpecial;

    document.getElementById('fox-content').innerHTML = `
      <div class="fox-card ${bisaHapus ? '' : 'fox-muted'}">
        <div class="fox-inline">
          <b>🗑 Hapus Halaman – Sysop FoxTools</b>
          <span class="fox-badge">${bisaHapus ? '🟢 Tersedia' : '🔴 Tidak tersedia'}</span>
        </div>
        <div>• Halaman: <b>${pageName}</b></div>
        <br>
        <label>• Alasan Penghapusan:</label>
        <br>
        <label> Alasan Umum:</label><br>
        <select id="fox-del-reason" style="width:100%">
          <option value="">Tidak ada</option>
          <option value="[[WP:KPC#U1|U1]]: Tulisan ngawur (${SysopFoxTools})">U1 – Tulisan ngawur</option>
          <option value="[[WP:KPC#U2|U2]]: Halaman uji coba (${SysopFoxTools})">U2 – Halaman uji coba</option>
          <option value="[[WP:KPC#U3|U3]]: Vandalisme (${SysopFoxTools})">U3 – Vandalisme</option>
          <option value="[[WP:KPC#U4|U4]]: Pembuatan ulang dari halaman yang sudah dihapus (${SysopFoxTools})">U4 – Pembuatan ulang dari halaman yang sudah dihapus</option>
          <option value="[[WP:KPC#U5|U5]]: Halaman yang dibuat oleh pengguna yang diblokir atau yang dilarang (${SysopFoxTools})">U5 – Halaman yang dibuat oleh pengguna yang diblokir atau yang dilarang</option>
          <option value="[[WP:KPC#U6|U6]]: Penghapusan teknis (${SysopFoxTools})">U6 – Penghapusan teknis</option>
          <option value="[[WP:KPC#U7|U7]]: Permintaan pembuat halaman atau pengosongan isi halaman (${SysopFoxTools})">U7 – Permintaan pembuat halaman atau pengosongan isi halaman</option>
          <option value="[[WP:KPC#U8|U8]]: Halaman yang tergantung pada halaman yang tak ada atau yang dihapus (${SysopFoxTools})">U8 – Halaman yang tergantung pada halaman yang tak ada atau yang dihapus</option>
          <option value="[[WP:KPC#U10|U10]]: Serangan atau olokan terhadap subjek atau entitas lain (${SysopFoxTools})">U10 – Serangan atau olokan terhadap subjek atau entitas lain</option>
          <option value="[[WP:KPC#U11|U11]]: Iklan, promosi murni/terang-terangan atau menyertakan pranala luar dengan tujuan promosi (${SysopFoxTools})">U11 – Iklan, promosi murni/terang-terangan atau menyertakan pranala luar dengan tujuan promosi</option>
          <option value="[[WP:KPC#U12|U12]]: Pelanggaran hak cipta murni/terang-terangan (${SysopFoxTools})">U12 – Pelanggaran hak cipta murni/terang-terangan</option>
        </select><br>
        <label> Alasan Lainnya:</label><br>
        <select id="fox-del-reason-other" style="width:100%">
          <option value="">Tidak ada</option>
          <option value="[[WP:KPC#A1|A1]]: Tanpa konteks">A1 – Tanpa konteks</option>
          <option value="[[WP:KPC#A2|A2]]: Artikel berbahasa asing yang tidak diterjemahkan atau diterjemahkan secara buruk">A2 – Artikel berbahasa asing yang tidak diterjemahkan atau diterjemahkan secara buruk</option>
          <option value="[[WP:KPC#A3|A3]]: Tanpa isi">A3 – Tanpa isi</option>
          <option value="[[WP:KPC#A5|A5]]: Artikel transwiki">A5 – Artikel transwiki</option>
          <option value="[[WP:KPC#A7|A7]]: Tidak mengindikasikan kepentingan (tokoh, organisasi, situs)">A7 – Tidak mengindikasikan kepentingan (tokoh, organisasi, situs)</option>
          <option value="[[WP:KPC#A9|A9]]: Artikel yang tidak mengindikasikan kepentingan (film, acara televisi, dan rekaman musik)">A9 – Artikel yang tidak mengindikasikan kepentingan (film, acara televisi, dan rekaman musik)</option>
          <option value="[[WP:KPC#A10|A10]]: Artikel yang tidak dirapikan dalam batas waktu yang telah ditentukan">A10 – Artikel yang tidak dirapikan dalam batas waktu yang telah ditentukan</option>
          <option value="[[WP:KPC#R2|R2]]: Pengalihan dari ruang nama artikel ke ruang nama lain">R2 – Pengalihan dari ruang nama artikel ke ruang nama lain</option>
          <option value="[[WP:KPC#R3|R3]]: Pengalihan yang baru dibuat karena kesalahan ketik atau kesalahan penamaan yang tidak disengaja">R3 – Pengalihan yang baru dibuat karena kesalahan ketik atau kesalahan penamaan yang tidak disengaja</option>
          <option value="[[WP:KPC#B1|B1]]: Redundan atau duplikat">B1 – Redundan atau duplikat</option>
          <option value="[[WP:KPC#B2|B2]]: Rusak atau kosong">B2 – Rusak atau kosong</option>
          <option value="[[WP:KPC#B3|B3]]: Lisensi yang tidak sesuai">B3 – Lisensi yang tidak sesuai</option>
          <option value="[[WP:KPC#B4|B4]]: Informasi lisensi kurang (tanpa sumber)">B4 – Informasi lisensi kurang (tanpa sumber)</option>
          <option value="[[WP:KPC#B5|B5]]: Berkas tak bebas yang tak digunakan">B5 – Berkas tak bebas yang tak digunakan</option>
          <option value="[[WP:KPC#B6|B6]]: Tidak memiliki alasan penggunaan tak bebas">B6 – Tidak memiliki alasan penggunaan tak bebas</option>
          <option value="[[WP:KPC#B7|B7]]: Klaim penggunaan wajar tidak sah">B7 – Klaim penggunaan wajar tidak sah</option>
          <option value="[[WP:KPC#B8|B8]]: Berkas yang sama persis tersedia di Wikimedia Commons">B8 – Berkas yang sama persis tersedia di Wikimedia Commons</option>
          <option value="[[WP:KPC#B9|B9]]: Terang-terangan melanggar hak cipta">B9 – Terang-terangan melanggar hak cipta</option>
          <option value="[[WP:KPC#B10|B10]]: Berkas media yang tidak berguna">B10 – Berkas media yang tidak berguna</option>
          <option value="[[WP:KPC#B11|B11]]: Tak ada bukti izin penggunaan">B11 – Tak ada bukti izin penggunaan</option>
        </select><br><br>
        <button id="fox-del-submit" ${bisaHapus ? '' : 'disabled'}>Terapkan</button>
      </div>
    `;

    const btn = document.getElementById('fox-del-submit');
    if (!btn) return;
    btn.addEventListener('click', async () => {
    	const reasonSelect = document.getElementById('fox-del-reason');
    	const reasonOther  = document.getElementById('fox-del-reason-other');
    	let reason = reasonSelect.value;
    	if (reasonOther && reasonOther.value.trim() !== '') {
    		reason += reasonOther.value.trim() + ` (${SysopFoxTools})`;
    	}
    	try {
    		await api.postWithToken('csrf', { 
    			action: 'delete', 
    			title: pageName, 
    			reason,
    			tags: 'FoxTools'
    		});
    		notiOK(`🗑 Halaman "${pageName}" dihapus.`);
    		document.getElementById('fox-panel').style.display = 'none';
    	} catch (e) {
    		notiERR(e?.error?.info || e);
    	}
    });
  }
  
 function panelProteksiSysop() {
    const pageName = mw.config.get('wgPageName');
    const panel = bukaPanel();
    const bisaProtect = !isSpecial;

    document.getElementById('fox-content').innerHTML = `
    <div class="fox-card ${bisaProtect ? '' : 'fox-muted'}">
      <div class="fox-inline">
        <strong>🔒 Pelindungan Halaman – Sysop FoxTools</strong>
        <span class="fox-badge">${bisaProtect ? '🟢 Tersedia' : '🔴 Tidak tersedia'}</span>
      </div>
        <br>
        <label>• Halaman: <b>${pageName}</b></label>
        <br>
        <label>• Jenis Proteksi:</label>
        <select id="sysop-protect-action" class="foxtools-input">
            <option value="edit">Penyuntingan</option>
            <option value="move">Pemindahan</option>
            <option value="create">Pembuatan Halaman</option>
        </select>
        <br>
        <label>• Tingkat Proteksi:</label>
        <select id="sysop-protect-level" class="foxtools-input">
            <option value="">Tidak ada</option>
            <option value="autoconfirmed">Semi (Terkonfirmasi otomatis)</option>
            <option value="extendedconfirmed">Lanjutan (Terkonfirmasi lanjutan)</option>
            <option value="sysop">Penuh (Pengurus)</option>
        </select>
        <br>
        <label>• Perubahan Tertunda:</label>
        <select id="sysop-protect-pc" class="foxtools-input">
            <option value="">Tidak ada</option>
            <option value="autoreview">Peninjau dan peninjau otomatis (Autoreview)</option>
            <option value="sysop">Pengurus (Sysop)</option>
        </select>
        <br>
        <label>• Durasi:</label>
        <select id="sysop-protect-expiry">
          <option value="12 hours" selected>12 jam</option>
          <option value="1 day">1 hari</option>
          <option value="3 days">3 hari</option>
          <option value="1 week">1 minggu</option>
          <option value="2 week">2 minggu</option>
          <option value="1 month">1 bulan</option>
          <option value="3 month">3 bulan</option>
          <option value="6 month">6 bulan</option>
          <option value="1 year">1 tahun</option>
          <option value="infinite">Tak terbatas</option>
        </select>
        <br>
        <label>• Alasan:</label>
        <select id="sysop-protect-summary">
          <option value="[[Wikipedia:Vandalisme|Vandalisme]] berulang-ulang" selected>Vandalisme berulang-ulang</option>
          <option value="Menjadi sasaran [[Wikipedia:Spam|spam]]">Menjadi sasaran spam</option>
          <option value="Menjadi sasaran [[Wikipedia:Suntingan yang mengganggu|penyuntingan yang menggangu]]">Menjadi sasaran penyuntingan yang menggangu</option>
          <option value="Menjadi sasaran [[Wikipedia:Perang suntingan|perang suntingan]] ataupun pengembalian ulang">Menjadi sasaran perang suntingan ataupun pengembalian ulang</option>
          <option value="Halaman dengan lalu-lintas tinggi">Halaman dengan lalu-lintas tinggi</option>
          <option value="Rawan disunting oleh [[Wikipedia:Pengguna siluman|pengguna siluman]]">Rawan disunting oleh pengguna siluman</option>
          <option value="Berulang kali dihapus dalam waktu dekat">Berulang kali dihapus dalam waktu dekat</option>
          <option value="Berulang kali diubah tanpa pembicaraan">Berulang kali diubah tanpa pembicaraan</option>
          <option value="Berulang kali disunting tanpa memberikan sumber terpercaya">Berulang kali disunting tanpa memberikan sumber terpercaya</option>
          <option value="Berulang kali dikosongkan tanpa pembicaraan">Berulang kali dikosongkan tanpa pembicaraan</option>
          <option value="Permintaan pembuat halaman">Permintaan pembuat halaman</option>
          <option value="Halaman arsip atau halaman arsip dengan lalu-lintas yang tinggi">Halaman arsip / halaman arsip dengan lalu-lintas yang tinggi</option>
          <option value="Berulang kali dialihkan tanpa pembicaraan">Berulang kali dialihkan tanpa pembicaraan</option>
          <option value="Vandalisme pemindahan halaman">Vandalisme pemindahan halaman</option>
          <option value="Pelindungan tidak diperlukan lagi">Pelindungan tidak diperlukan lagi</option>
          <option value="Per permohonan di [[Wikipedia:Permintaan pelindungan halaman/Pengurangan|permintaan pengurangan]]">Per permohonan di permintaan pengurangan</option>
        </select>
        <br>
        <button id="sysop-protect-do" class="foxtools-button">Terapkan</button>
        <div id="sysop-protect-status" style="margin-top:10px;"></div>
       </div>
    `;

    document.getElementById('sysop-protect-do').addEventListener('click', async () => {
        const action = document.getElementById('sysop-protect-action').value;
        const level = document.getElementById('sysop-protect-level').value;
        const expiry = document.getElementById('sysop-protect-expiry').value;
        const summary = document.getElementById('sysop-protect-summary').value;
        const pcLevel = document.getElementById('sysop-protect-pc').value;

        const statusBox = document.getElementById('sysop-protect-status');
        statusBox.innerHTML = "⏳ Memproses permintaan...";

        try {
            const api = new mw.Api();
            await api.postWithToken('csrf', {
                action: 'protect',
                title: pageName,
                protections: `${action}=${level}`,
                expiry: expiry,
                reason: summary + ` (${SysopFoxTools})`,
                watchlist: 'nochange',
                tags: 'FoxTools'
            });
            
            if (pcLevel) {
            	await api.postWithToken('csrf', {
            		action: 'stabilize',
            		title: pageName,
            		protectlevel: pcLevel,
            		expiry: expiry,
            		reason: summary + ` (${SysopFoxTools})`,
            		watchlist: 'nochange',
            		tags: 'FoxTools'
            	});
            }

            notiOK(`🟢 Pelindungan halaman berhasil diterapkan.`);
    		document.getElementById('fox-panel').style.display = 'none';
        } catch (e) {
            console.error(e);
           	notiERR(e?.error?.info || e);
        }
    });
 }

$(document).ready(function () {
    if (mw.config.get('wgCanonicalSpecialPageName') !== 'Contributions') {
        return;
    }

    if ($('#rollback-box').length === 0) {
        var $rollbackBox = $(`
            <div id="rollback-box" class="mw-htmlform-ooui-wrapper oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-padded oo-ui-panelLayout-framed">
                <form id="rollback-form" class="mw-htmlform mw-htmlform-ooui oo-ui-layout oo-ui-formLayout">
                    <fieldset class="oo-ui-layout oo-ui-labelElement oo-ui-fieldsetLayout mw-collapsibleFieldsetLayout mw-collapsible mw-made-collapsible">
                        <legend role="button" class="oo-ui-fieldsetLayout-header mw-collapsible-toggle mw-collapsible-toggle-expanded" aria-expanded="true" tabindex="0">
                            <span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span>
                            <span class="oo-ui-labelElement-label">🦊 Sysop FoxTools – Mass Rollback</span>
                            <span class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement-icon oo-ui-icon-expand oo-ui-iconElement oo-ui-labelElement-invisible oo-ui-iconWidget">Lihat</span>
                            <span class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement-icon oo-ui-icon-collapse oo-ui-iconElement oo-ui-labelElement-invisible oo-ui-iconWidget">Tutup</span>
                        </legend>
                        <div class="oo-ui-fieldsetLayout-group mw-collapsible-content" style="display: block;">
                            <div class="oo-ui-widget oo-ui-widget-enabled">
                                <label for="rollback-reason" class="oo-ui-labelElement-label">Alasan untuk mengembalikan semua suntingan (opsional):</label>
                                <select id="rollback-reason" class="oo-ui-inputWidget-input oo-ui-dropdownWidget">
                                    <option value="">-- Pilih alasan --</option>
                                    <option value="Uji coba">Uji coba</option>
                                    <option value="Vandalisme">Vandalisme</option>
                                    <option value="Spam">Spam</option>
                                    <option value="Mengembalikan">Mengembalikan</option>
                                </select>
                                <input type="text" id="rollback-summary" placeholder="Alasan custom (opsional)" class="oo-ui-inputWidget-input oo-ui-textInputWidget-input" style="margin-top: 10px; padding: 5px; width: 100%;"/>
                            </div>
                            <div class="oo-ui-widget oo-ui-widget-enabled mw-htmlform-submit-buttons">
                                <button id="rollback-selected-button" class="oo-ui-inputWidget-input oo-ui-buttonElement-button oo-ui-buttonElement-framed oo-ui-flaggedElement-progressive" style="padding: 5px 10px; background-color: #007bff; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Kembalikan suntingan yang dipilih</button>
                                <button id="rollback-all-button" class="oo-ui-inputWidget-input oo-ui-buttonElement-button oo-ui-buttonElement-framed oo-ui-flaggedElement-destructive" style="padding: 5px 10px; background-color: #ff4136; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Kembalikan semua suntingan</button>
                                <button id="cancel-rollback" class="oo-ui-inputWidget-input oo-ui-buttonElement-button oo-ui-buttonElement-framed" style="padding: 5px 10px; background-color: #aaa; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Batalkan</button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        `);

        $('#mw-content-text').prepend($rollbackBox);

        // Synchronize dropdown with input field
        $('#rollback-reason').change(function () {
            var selectedReason = $(this).val();
            var currentSummary = $('#rollback-summary').val();
            if (!currentSummary) {
                $('#rollback-summary').val(selectedReason);
            }
        });

        $('#rollback-box .mw-collapsible-toggle').click(function () {
            var $content = $(this).closest('fieldset').find('.mw-collapsible-content');
            var isExpanded = $(this).attr('aria-expanded') === 'true';

            if (isExpanded) {
                $content.slideUp();
                $(this).attr('aria-expanded', 'false');
                $(this).find('.oo-ui-icon-collapse').hide();
                $(this).find('.oo-ui-icon-expand').show();
            } else {
                $content.slideDown();
                $(this).attr('aria-expanded', 'true');
                $(this).find('.oo-ui-icon-expand').hide();
                $(this).find('.oo-ui-icon-collapse').show();
            }
        });
        
        $('#rollback-selected-button').click(function () {
            var userName = mw.config.get('wgRelevantUserName');
            var summary = $('#rollback-summary').val();
            var api = new mw.Api();

            var selectedRevisions = $('input[type="checkbox"].rollback-checkbox:checked').map(function () {
                return {
                    title: $(this).data('title'),
                    revid: $(this).data('revid'),
                    parentid: $(this).data('parentid')
                };
            }).get();

            if (selectedRevisions.length === 0) {
                alert('🦊 FoxTools\n\nTidak ada suntingan yang ditandai untuk dikembalikan.');
                return;
            }

            var rollbackPromises = selectedRevisions.map(function (contrib) {
                var formattedSummary = `Mengembalikan suntingan [[Istimewa:Kontribusi/${userName}|${userName}]] secara massal` + (summary ? `: ${summary}` : '') + ` (${SysopFoxTools})`;

                return api.postWithToken('csrf', {
                    action: 'edit',
                    undoafter: contrib.parentid,
                    undo: contrib.revid,
                    title: contrib.title,
                    summary: formattedSummary,
                    tags: 'FoxTools'
                });
            });

            Promise.all(rollbackPromises).then(function () {
                alert('🦊 FoxTools\n\nSuntingan yang dipilih telah dikembalikan!');
                location.reload();
            }).catch(function (error) {
                console.error('An error occured when reverting changes:', error);
                alert('An error occurred while reverting edit(s).');
            });
        });

        $('#rollback-all-button').click(function () {
            var userName = mw.config.get('wgRelevantUserName');
            var summary = $('#rollback-summary').val();
            var api = new mw.Api();

            api.get({
                action: 'query',
                list: 'usercontribs',
                ucuser: userName,
                uclimit: 'max',
                ucprop: 'ids|title',
                format: 'json'
            }).done(function (data) {
                var contributions = data.query.usercontribs;

                if (contributions.length === 0) {
                    alert('🦊 FoxTools\n\nTidak ada suntingan yang ditandai untuk dikembalikan.');
                    return;
                }

                var rollbackPromises = contributions.map(function (contrib) {
                    var formattedSummary = `Mengembalikan suntingan [[Istimewa:Kontribusi/${userName}|${userName}]] secara massal` + (summary ? `: ${summary}` : '') + `(${SysopFoxTools})`;

                    return api.postWithToken('csrf', {
                        action: 'edit',
                        undoafter: contrib.parentid,
                        undo: contrib.revid,
                        title: contrib.title,
                        summary: formattedSummary,
                        tags: 'FoxTools'
                    });
                });

                Promise.all(rollbackPromises).then(function () {
                    alert('🦊 FoxTools\n\nSuntingan yang dipilih telah dikembalikan!');
                    location.reload();
                }).catch(function (error) {
                    console.error('An error occured when reverting:', error);
                    alert('An error occured while reverting.');
                });
            }).fail(function (error) {
                console.error('Error with downloading contributions:', error);
                alert('Error with downloading contributions.');
            });
        });

        $('#cancel-rollback').click(function () {
            $('#rollback-box').hide();
        });

        $('li[data-mw-revid]').each(function () {
            var $this = $(this);
            var revid = $this.data('mw-revid');
            var parentid = $this.data('mw-prev-revid');
            var title = $this.find('.mw-contributions-title').text();

            var $checkbox = $('<input type="checkbox" class="rollback-checkbox" style="margin-right: 5px;">')
                .data('revid', revid)
                .data('parentid', parentid)
                .data('title', title);

            $this.prepend($checkbox);
        });
    }
  });

  buatTombol('🔨 Blokir Pengguna', panelBlokir);
  buatTombol('🗑 Hapus Halaman', panelHapus);
  buatTombol('🔒 Lindungi Halaman', panelProteksiSysop);
  buatTombol('↩️ Mass Rollback', panelMassRollbackSysop);
})();

// </nowiki>
