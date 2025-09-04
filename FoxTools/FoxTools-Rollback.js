// ––– FoxTools Rollback Start –––
//<nowiki>

const FoxTools = `[[WP:FT|🦊 FoxTools]]`;

function addFoxRollbackButtons() {
    if (!['Contributions', 'Recentchanges'].includes(mw.config.get('wgCanonicalSpecialPageName'))) {
        return;
    }

    const seenPages = new Set();
    const api = new mw.Api();

    $('li[data-mw-revid]').each(async function () {
        const $li = $(this);
        const revid = $li.data('mw-revid');
        const page = $li.find('.mw-contributions-title').text() || mw.config.get('wgPageName');
        const user = mw.config.get('wgRelevantUserName');

        if (seenPages.has(page)) {
            return;
        }

        let latestRevId = null;
        try {
            const latest = await api.get({
                action: 'query',
                prop: 'revisions',
                titles: page,
                rvlimit: 1,
                rvprop: 'ids',
                format: 'json'
            });
            const pages = latest.query.pages;
            for (const id in pages) {
                latestRevId = pages[id].revisions?.[0]?.revid;
            }
        } catch (err) {
            console.warn(`Gagal cek revisi terbaru untuk ${page}`, err);
            return;
        }

        if (latestRevId !== revid) {
            return;
        }

        seenPages.add(page);

        let editCount = 1;
        try {
            const data = await api.get({
                action: 'query',
                prop: 'revisions',
                titles: page,
                rvlimit: 50,
                rvprop: 'ids|user',
                format: 'json'
            });

            const pages = data.query.pages;
            for (const id in pages) {
                const revs = pages[id].revisions || [];
                let foundFirst = false;
                for (const rev of revs) {
                    if (!foundFirst && rev.revid === revid) {
                        foundFirst = true;
                        continue;
                    }
                    if (foundFirst) {
                        if (rev.user === user) {
                            editCount++;
                        } else {
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Gagal menghitung jumlah suntingan:', err);
        }

        const $btn = $('<button>')
            .addClass('foxtools-rollback')
            .text(`[kembalikan ${editCount} suntingan]`)
            .css({
                marginLeft: '10px',
                padding: '5px 10px',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid #a2a9b1',
                borderRadius: '2px',
                backgroundColor: '#f8f9fa',   
                color: 'darkgreen',
            })
            .click(async function (e) {
                e.preventDefault();

                const ok = confirm(`🦊 FoxTools\n\nYakin mau mengembalikan ${editCount} suntingan ${user} di halaman ${page}?`);
                if (!ok) return;

                $(this).prop('disabled', true).text('[memproses...]');

                try {
                    const data = await api.get({
                        action: 'query',
                        prop: 'revisions',
                        titles: page,
                        rvlimit: 'max',
                        rvprop: 'ids|user',
                        format: 'json'
                    });

                    const pages = data.query.pages;
                    let lastGoodRevId = null;
                    for (const id in pages) {
                        const revs = pages[id].revisions || [];
                        for (const rev of revs) {
                            if (rev.user !== user) {
                                lastGoodRevId = rev.revid;
                                break;
                            }
                        }
                    }

                    if (!lastGoodRevId) {
                        alert('Tidak ditemukan revisi sebelum suntingan pengguna ini.');
                        $(this).remove();
                        return;
                    }

                    await api.postWithToken('csrf', {
                        action: 'edit',
                        title: page,
                        undo: revid,
                        undoafter: lastGoodRevId,
                        summary: `Mengembalikan ${editCount} suntingan [[Istimewa:Kontribusi/${user}|${user}]] (${FoxTools})`,
                        tags: 'FoxTools'
                    });

                    alert(`✅ Berhasil mengembalikan ${editCount} suntingan ${user} di halaman ${page}.`);
                    $(this).remove();
                } catch (err) {
                    console.error('FoxRollback error', err);
                    alert('❌ Terjadi kesalahan saat mengembalikan suntingan.');
                    $(this).remove();
                }
            });

        $li.append($btn);
    });
}

function addFoxRollbackInHistory() {
    if (mw.config.get('wgAction') !== 'history') return;

    const $rows = $('li[data-mw-revid]');
    if (!$rows.length) return;

    const topUser = $rows.first().find('.mw-userlink').text();
    const page = mw.config.get('wgPageName');

    let count = 0;
    let lastGoodRevId = null;

    $rows.each(function () {
        const $row = $(this);
        const user = $row.find('.mw-userlink').text();
        const revid = $row.data('mw-revid');
        if (user === topUser) {
            count++;
        } else {
            lastGoodRevId = revid;
            return false;
        }
    });

    const topRevid = $rows.first().data('mw-revid');

    const $first = $rows.first();
    if ($first.find('.foxtools-rollback').length) return;

    const $btn = $('<button>')
        .addClass('foxtools-rollback')
        .text(`[kembalikan ${count} suntingan]`)
        .css({ 
        	marginLeft: '10px', 
            padding: '5px 10px', 
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer', 
            color: 'darkgreen' 
        })
        .click(function (e) {
            e.preventDefault();
            const ok = confirm(`🦊 FoxTools\n\nYakin mau mengembalikan ${count} suntingan ${topUser} di halaman ${page}?`);
            if (ok) {
                addfoxRollbackButtons;
            }
        });

    $first.append($btn);
}

$(addFoxRollbackButtons);
$(addFoxRollbackInHistory);

//</nowiki>
// ––– FoxTools Rollback End –––
