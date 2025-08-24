/**
 * +------------------------------------------------------------------------------------+
 * |                  === ⚠️ PERHATIAN ⚠️ ===                                           |
 * |             Mengubah halaman ini dapat mempengaruhi banyak pengguna.               |
 * |           Harap diskusi di [[Pembicaraan Wikipedia:FoxTools]] sebelum menyunting.  |         	 
 * +------------------------------------------------------------------------------------+
 *
 * This is Vukova's FoxTools, anti-vandalism mobile script for newbies and every Wikipedian. Visit [[WP:FT]] for more information.
 */

// <nowiki>

(function () {

  if (mw.config.get('skin') !== 'minerva') return;
  const menu = document.querySelector('.minerva-user-menu ul');
  if (!menu) return;
  
  const style = document.createElement('style');
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
    
    #fox-panel button:hover { background: #0f0; color: #000; }
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
    
    #fox-panel button {
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
  
  const FoxTools = '[[WP:FT|🦊 FoxTools]]';
  const sig = '~'.repeat(4);
  
  const buatTombol = (label, onclick) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    a.style.display = 'block';
    a.style.textAlign = 'center';
    a.style.padding = '10px 0';
    a.style.color = 'var(--theme-accent-color)';
    a.addEventListener('click', e => {
      e.preventDefault();
      onclick();
    });
    li.className = 'menu-action';
    li.appendChild(a);
    menu.appendChild(li);
  };

  const buatPanelUtama = () => {
    let panel = document.querySelector('#fox-panel');
    if (panel) return panel.style.display = 'block';
    panel = document.createElement('div');
    panel.id = 'fox-panel';
    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <big><strong>🦊 FoxTools</strong></big>
          <button id="fox-close" style="background:#111;color:#0f0;border:none;font-weight:bold">X</button>
        </div>
        <small>♥️ Dibuat dengan cinta oleh Rubah Hitam Vukova</small>
        <div id="fox-content" style="margin-top:1em"></div>
      </div>
    `;
    document.body.appendChild(panel);
    document.getElementById('fox-close').onclick = () => panel.style.display = 'none';
    return panel;
  };

  function buatTombolLaporVandal() {
    buatTombol('🧹 IPTV', () => {
      const panel = buatPanelUtama();
      const konten = document.getElementById('fox-content');
      konten.innerHTML = `
        <strong>🧹 Melaporkan Vandalisme – FoxTools</strong><br><br>
        <label>Nama pengguna:</label><br>
        <input id="fox-nama-vandal" style="width:100%"><br>
        <label>Alasan:</label><br>
        <select id="fox-alasan-vandal" style="width:100%">
          <option value="Vandalisme setelah peringatan akhir diberikan">Vandalisme setelah peringatan akhir (level 4 atau 4im) diberikan</option>
          <option value="Vandalisme setelah masa berlaku pemblokiran berakhir">Vandalisme setelah masa berlaku pemblokiran berakhir (dalam rentang waktu 1 hari)</option>
          <option value="Akun yang jelas merupakan bot spam atau hanya digunakan untuk spam">Akun yang jelas merupakan bot spam atau hanya digunakan untuk spam</option>
        </select><br>
        <input id="fox-komentar-lain" style="width:100%" placeholder="Komentar"><br>
        <button id="fox-kirim-vandal">Kirim</button>
      `;
      document.getElementById('fox-kirim-vandal').onclick = async () => {
        const nama = document.getElementById('fox-nama-vandal').value.trim();
        const alasanSelect = document.getElementById('fox-alasan-vandal').value;
        const komentarLain = document.getElementById('fox-komentar-lain').value.trim();
        if (!nama) return alert('Masukkan nama pengguna!');
        const alasan = alasanSelect;
        const komentar = komentarLain;
        if (!alasan) return alert('Masukkan alasan!');
        
        const page = 'Wikipedia:Intervensi pengurus terhadap vandalisme';
        const sectionHeader = '== Laporan pengguna ==';
        const laporan = `* {{Vandal-m|${nama}}} — '''Alasan:''' ${alasan}. ${komentar}. --${sig}`;
        
        const api = new mw.Api();
        const res = await api.get({
        	action: 'query',
        	prop: 'revisions',
        	titles: page,
        	rvslots: 'main',
        	rvprop: 'content',
        	formatversion: 2, 
        	format: 'json'
        });
        const content = res.query.pages[0].revisions[0].slots.main.content;
        const updated = content.replace(
        	/(== Laporan pengguna ==\n)([\s\S]*?)(?=\n==|$)/,
        	(match, header, body) => `${header}${body.trim()}\n${laporan}\n`
        	);  
        	await api.postWithEditToken({
        		action: 'edit',
        		title: page,
        		text: updated,
        		summary: `Melaporkan [[Istimewa:Kontribusi/${nama}|${nama}]] (${FoxTools})`,
        		format: 'json',
        		tags: `FoxTools`
        	});
        	alert('🦊 FoxTools\n\nLaporan berhasil dikirim!');
      };
    });
  }

  function buatTombolPelindungan() {
    buatTombol('🔒 PPH', () => {
      const panel = buatPanelUtama();
      const konten = document.getElementById('fox-content');
      konten.innerHTML = `
        <strong>🔒 Permintaan Pelindungan Halaman – FoxTools</strong><br><br>
        <label>Alasan permintaan pelindungan:</label><br>
        <input id="fox-alasan-pelindungan" style="width:100%"><br>
        <button id="fox-kirim-pelindungan">Kirim</button>
      `;
      document.getElementById('fox-kirim-pelindungan').onclick = async () => {
        const alasan = document.getElementById('fox-alasan-pelindungan').value.trim();
        if (!alasan) return alert('🦊 FoxTools\n\nMasukkan alasan yang valid!');
        const isi = `{{status}}\n* Nama halaman: [[${JudulHalaman}]]\n* Alasan perlindungan: ${alasan}\n* Pemohon: ${sig}`
        const judulHalaman = mw.config.get('wgPageName').replace(/_/g, ' ');
        const tanggal = new Date().toLocaleDateString('id-ID', {
        	day: 'numeric', month: 'long', year: 'numeric'
        });
        const sectionTitle = `[[${judulHalaman}]] (${tanggal})`;
        await new mw.Api().postWithToken('csrf', {
        	action: 'edit',
        	title: 'Wikipedia:Permintaan_pelindungan_halaman/Peningkatan',
        	section: 'new',
        	sectiontitle: sectionTitle,
        	appendtext: isi,
        	summary: `Permintaan pelindungan untuk halaman [[${judulHalaman}]] (${FoxTools})`,
        	tags: `FoxTools`
        });
        alert('🦊 FoxTools\n\nPermintaan pelindungan dikirim!');
      };
    });
  }

  function buatTombolKPC() {
    buatTombol('🗑️ KPC', () => {
      const panel = buatPanelUtama();
      const konten = document.getElementById('fox-content');
               
      konten.innerHTML = `
        <strong>🗑️ Meminta Penghapusan Cepat – FoxTools</strong><br>
        <label><small>Harap pilih salah satu alasan yang tertera di bawah!</small></label><br><br>
        <label>Alasan umum:</label><br>
        <select id="fox-kode-kpc-utama" style="width:100%">
          <option value="">Tidak ada</option>
          <option value="U1">U1 – Tulisan ngawur</option>
          <option value="U2">U2 – Halaman uji coba</option>
          <option value="U3">U3 – Vandalisme</option>
          <option value="U4">U4 – Pembuatan ulang dari halaman yang sudah dihapus</option>
          <option value="U5">U5 – Halaman yang dibuat oleh pengguna yang diblokir atau yang dilarang</option>
          <option value="U6">U6 – Penghapusan teknis</option>
          <option value="U7">U7 – Permintaan pembuat halaman atau pengosongan isi halaman</option>
          <option value="U8">U8 – Halaman yang tergantung pada halaman yang tak ada atau yang dihapus</option>
          <option value="U10">U10 – Serangan atau olokan terhadap subjek atau entitas lain</option>
          <option value="U11">U11 – Iklan, promosi murni/terang-terangan atau menyertakan pranala luar dengan tujuan promosi</option>
          <option value="U12">U12 – Pelanggaran hak cipta murni/terang-terangan</option>
        </select><br>
        <label>Alasan lainnya:</label><br>
        <select id="fox-kode-kpc-lainnya" style="width:100%">
          <option value="">Tidak ada</option>
          <option value="A1">A1 – Tanpa konteks</option>
          <option value="A2">A2 – Artikel berbahasa asing yang tidak diterjemahkan atau diterjemahkan secara buruk</option>
          <option value="A3">A3 – Tanpa isi</option>
          <option value="A5">A5 – Artikel transwiki</option>
          <option value="A7">A7 – Tidak mengindikasikan kepentingan (tokoh, organisasi, situs)</option>
          <option value="A9">A9 – Artikel yang tidak mengindikasikan kepentingan (film, acara televisi, dan rekaman musik)</option>
          <option value="A10">A10 – Artikel yang tidak dirapikan dalam batas waktu yang telah ditentukan</option>
          <option value="R2">R2 – Pengalihan dari ruang nama artikel ke ruang nama lain</option>
          <option value="R3">R3 – Pengalihan yang baru dibuat karena kesalahan ketik atau kesalahan penamaan yang tidak disengaja</option>
          <option value="B1">B1 – Redundan atau duplikat</option>
          <option value="B2">B2 – Rusak atau kosong</option>
          <option value="B3">B3 – Lisensi yang tidak sesuai</option>
          <option value="B4">B4 – Informasi lisensi kurang (tanpa sumber)</option>
          <option value="B5">B5 – Berkas tak bebas yang tak digunakan</option>
          <option value="B6">B6 – Tidak memiliki alasan penggunaan tak bebas</option>
          <option value="B7">B7 – Klaim penggunaan wajar tidak sah</option>
          <option value="B8">B8 – Berkas yang sama persis tersedia di Wikimedia Commons</option>
          <option value="B9">B9 – Terang-terangan melanggar hak cipta</option>
          <option value="B10">B10 – Berkas media yang tidak berguna</option>
          <option value="B11">B11 – Tak ada bukti izin penggunaan</option>
        </select><br>
        <button id="fox-kirim-kpc">Terapkan</button>
      `;
      document.getElementById('fox-kirim-kpc').onclick = async () => {
        const kodeUtama = document.getElementById('fox-kode-kpc-utama').value;
        const kodeLain = document.getElementById('fox-kode-kpc-lainnya').value;
        const kode = kodeUtama || kodeLain;
        if (!kode) {
        	alert('⚠️ Pilih salah satu alasan penghapusan.');
        	return;
        }
       
        const halaman = mw.config.get('wgPageName');
        const wikitext = `{{Db|${kode}|nocat=yes}}`;
        await new mw.Api().postWithToken('csrf', {
          action: 'edit',
          title: halaman,
          prependtext: wikitext + '\n',
          summary: `Meminta penghapusan cepat: KPC ${kode} (${FoxTools})`,
          tags: `FoxTools`
        });
        
        alert('🦊 FoxTools\n\nHalaman ditandai untuk penghapusan cepat.');
      };
    });
  }
  
  function buatTombolMassRollbackFoxTools() {
    buatTombol('↩️ Mass Rollback', () => {
        const isContribsPage = mw.config.get('wgCanonicalSpecialPageName') === 'Contributions';
        if (!isContribsPage) return;

        const rollbackLinks = Array.from(document.querySelectorAll('.mw-rollback-link a'));
        if (!rollbackLinks.length) {
            alert('Tidak ditemukan tautan rollback di halaman ini.');
            return;
        }

        const panel = buatPanelUtama();
        const konten = document.getElementById('fox-content');

        konten.innerHTML = `
            <strong>↩️ Mass Rollback – FoxTools</strong><br>
            <label>Yakin ingin melakukan mass rollback <b>SEMUA</b> suntingan pengguna ini?</label><br><br>
            <button id="fox-rollback-confirm" class="foxtools-button">Ya</button>
        `;
        
        document.getElementById('fox-rollback-confirm').addEventListener('click', async () => {
        	let count = 0;
        	
        	const promises = Array.from(rollbackLinks).map(async (link) => {
        		try {
        			await fetch(link.href, { method: 'POST' });
        			link.textContent += `\n[🟢 Sukses]`;
            count++;
        } catch (e) {
            console.warn(`Gagal rollback ${link.href}`, e);
            link.textContent += `\n[🔴 Gagal]`;
        }
    });

    await Promise.all(promises);
    
    konten.innerHTML += `<br><br><strong>🟢 Selesai! ${count} revisi telah dikembalikan.</strong>`;
        	
        });
    });
  }
                
  buatTombolLaporVandal();
  buatTombolPelindungan();
  buatTombolKPC();
  buatTombolMassRollbackFoxTools();
})();

// </nowiki>
