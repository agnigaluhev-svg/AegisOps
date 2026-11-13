# AegisOps

Dashboard statis untuk demonstrasi alur pertahanan siber: event sintetis → deteksi berbasis aturan → korelasi aset dan firewall → alert berbukti → rekomendasi aman → pengelolaan insiden.

## Menjalankan secara lokal

Tidak ada backend, proses build, atau dependency JavaScript. Karena aplikasi menggunakan ES modules, jalankan server file statis dari folder ini:

```powershell
py -m http.server 8000
```

Buka `http://localhost:8000` di browser. Jika `py` tidak tersedia, gunakan server HTTP statis lain. Font IBM Plex dimuat dari Google Fonts; font sistem menjadi fallback jika jaringan tidak tersedia.

## Mencoba demo

1. Pastikan banner **Data simulasi** terlihat.
2. Di Overview, pilih skenario dan tekan **Jalankan**. Skenario yang tersedia: port scan, brute force SSH, perangkat baru, dan telemetri UPS.
3. Buka Cyber Threat Detection untuk detail alert, bukti event, dampak aset, rincian risiko, dan rekomendasi.
4. Dari detail alert pilih **Buat insiden**. Tambahkan penanggung jawab/catatan, setujui simulasi isolasi jika ingin, lalu ubah status ke selesai atau false positive.
5. Security Event Analysis menampilkan filter dan payload raw setiap event. Reset demo menghapus data simulasi yang tersimpan di browser.

Port scan memakai 18 port dalam 30 detik; brute force memakai 8 login gagal lalu 1 berhasil dalam 60 detik. Seed skenario tetap `20261113`. Data sesi disimpan di `localStorage` browser.

## Struktur

- `index.html`, `styles.css`: shell aplikasi dan sistem tampilan responsif.
- `src/data.js`: inventaris simulasi dan pembangkit skenario deterministik.
- `src/engine.js`: fungsi murni deteksi, korelasi, dan skor risiko.
- `src/main.js`: state sesi, simulator, navigasi, dan UI.
- `PROJECT_CONTEXT.md`, `PRD.md`, `ARCHITECTURE.md`, `TASKS.md`, `AGENTS (1).md`: dokumen proyek sumber.

## Batasan demo

Semua event, perangkat, metrik, status kesehatan, serta tindakan mitigasi adalah simulasi browser. Aplikasi tidak memindai jaringan, mengirim paket, mengendalikan perangkat, atau mengintegrasikan sensor nyata. Integrasi Suricata/Zeek, akses multi-user, dan backend belum dibangun.
