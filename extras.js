/* Lima Waktu: preference controls, exports and offline installation. */
(() => {
  'use strict';
  const L = window.LimaWaktu;
  const $ = s => document.querySelector(s);
  const { state, simpan } = L;
  $('#zona-gps').value = String(state.perangkat?.tz || 7);
  function zonaUI(){const gps=state.kota==='perangkat';$('#zona-gps').hidden=!gps;$('label[for="zona-gps"]').hidden=!gps;}
  document.addEventListener('lima:update',zonaUI); zonaUI();
  $('#zona-gps').addEventListener('change',()=>{if(state.perangkat){state.perangkat.tz=+$('#zona-gps').value;L.kotaAktif().tz=state.perangkat.tz;simpan();L.renderSemua();}});
  const tema = $('#tema');
  tema.value = state.tema || 'otomatis';
  function tampilan() {
    const jam = L.waktuLokal().getHours();
    document.documentElement.dataset.tema = tema.value === 'otomatis' ? (jam >= 6 && jam < 18 ? 'terang' : 'gelap') : tema.value;
  }
  tema.addEventListener('change', () => { state.tema = tema.value; simpan(); tampilan(); });
  tampilan();
  setInterval(tampilan, 60000);
  state.perWaktu ||= {};
  $('#per-waktu').innerHTML = L.SHOLAT_WAJIB.map(k => `<label class="checklist__baris"><input type="checkbox" data-adzan="${k}" ${state.perWaktu[k] !== false ? 'checked' : ''}>${L.SHOLAT.find(s => s.kunci === k).nama}</label>`).join('');
  $('#per-waktu').addEventListener('change', e => { const k=e.target.dataset.adzan; if(k){state.perWaktu[k]=e.target.checked;simpan();} });
  $('#tasbih-custom').value = state.tasbih.target;
  $('#tasbih-custom').addEventListener('change', () => {
    const target = Math.max(1, Math.min(10000, Math.floor(+$('#tasbih-custom').value || 33)));
    $('#tasbih-custom').value = target;
    state.tasbih.target = target; state.tasbih.n = 0; simpan(); L.renderTasbih();
  });
  $('#unduh-jadwal').addEventListener('click', () => {
    const lines = [...document.querySelectorAll('.bulanan__tabel tr')].map(tr => [...tr.children].map(td => '"'+td.textContent.replaceAll('"','""')+'"').join(','));
    const metadata = `"Lima Waktu","${$('#bulanan-nama').textContent}","${$('#bulan-lokasi').textContent}"`;
    const url = URL.createObjectURL(new Blob(['\uFEFF'+metadata+'\r\n'+lines.join('\r\n')], {type:'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href=url; a.download=`lima-waktu-${$('#bulan-pilih').value}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('#cetak-jadwal').addEventListener('click', () => window.print());
  const mode = $('#ramadan-mode'); mode.checked = !!state.ramadan;
  $('#sahur').value = String(state.sahur || 0);
  function ramadan() {
    $('#ramadan-isi').hidden = !mode.checked;
    const w = L.waktuHariIni();
    $('#ramadan-jadwal').textContent = `Imsak ${L.formatJam(w.imsak,state.format)} · Subuh ${L.formatJam(w.subuh,state.format)} · Berbuka ${L.formatJam(w.maghrib,state.format)}`;
  }
  mode.addEventListener('change', () => {state.ramadan=mode.checked;simpan();ramadan();});
  $('#sahur').addEventListener('change', () => {state.sahur=+$('#sahur').value;simpan();});
  document.addEventListener('lima:update',ramadan); ramadan();
  let lastSahur = '';
  setInterval(() => {
    if(!state.ramadan || !state.sahur) return;
    const d=L.waktuLokal(), w=L.waktuHariIni(d);
    let target=L.tanggalDariJam(d,w.subuh);
    if(target.getTime()<Date.now()){d.setDate(d.getDate()+1);target=L.tanggalDariJam(d,L.waktuHariIni(d).subuh);}
    const trigger=target.getTime()-state.sahur*60000;
    if(Date.now()>=trigger && Date.now()<trigger+45000 && lastSahur!==String(trigger)){
      lastSahur=String(trigger);L.tampilPita('Pengingat sahur',`Subuh sekitar ${state.sahur} menit lagi. Selamat menyiapkan sahur.`);
    }
  },1000);
  let installEvent;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;});
  $('#pasang-app').addEventListener('click',async()=>{
    if(installEvent){await installEvent.prompt();installEvent=null;}
    else L.tampilPita('Pasang Lima Waktu','Buka menu browser → Pasang aplikasi / Tambahkan ke layar utama. Di iPhone: Safari → Bagikan → Tambah ke Layar Utama.');
  });
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{$('#offline-status').textContent='Penyimpanan offline belum tersedia di browser ini. Jadwal tetap bisa digunakan selama halaman terbuka.';});
})();
