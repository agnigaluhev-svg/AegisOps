# AGENTS.md — Panduan untuk AI Agent (Claude Code, Cursor, Copilot, dll.)

Berkas ini menetapkan cara kerja agent pada proyek **AegisOps**. Jika instruksi pengguna bertentangan dengan berkas ini, **ikuti pengguna**, lalu catat perbedaannya.

## 0. Baca dulu, urut

1. `docs/PROJECT_CONTEXT.md` — tujuan, kompetisi, prinsip
2. `docs/PRD.md` — apa yang dibangun, prioritas P0/P1/P2, kriteria penerimaan
3. `docs/ARCHITECTURE.md` — skema, rule, struktur kode
4. `docs/TASKS.md` — urutan kerja dan checklist

Jangan mulai menulis kode sebelum keempatnya dibaca.

## 1. Misi singkat

Bangun **Cyber Defense Dashboard** yang bisa dibuka juri lewat satu URL dan memperagakan alur **deteksi → korelasi → alert berbukti → rekomendasi aman → incident management**. Batas waktu pengumpulan: **15 Nov 2026**. Waktu sangat sempit. **Kerjakan P0 dulu, selesaikan end-to-end, baru poles.**

## 2. Aturan keras (jangan dilanggar)

1. **Label data simulasi.** Banner "Data simulasi" harus selalu terlihat. Jangan menulis teks yang menyiratkan data nyata.
2. **Tanpa klaim palsu.** Jangan menulis "AI-powered", "zero-day", "prediksi pasti rusak", "sudah dipakai oleh TNI/Polri", atau klaim adopsi lain. Prediksi = indikasi + keyakinan. Deteksi = aturan yang bisa dijelaskan.
3. **Tidak ada alat serang.** Dilarang menulis kode yang memindai, menyerang, atau mengirim lalu lintas ke host nyata. Skenario scan/brute force hanyalah **event sintetis** (array data). Jangan menambahkan modul exploit, scanner, atau payload.
4. **Tindakan mitigasi = simulasi + persetujuan.** Tombol blokir/isolasi hanya mencatat tindakan dan mengubah state demo setelah konfirmasi di dalam halaman.
5. **Jangan menyalin merek atau aset pihak lain.** Referensi UI hanya untuk tata letak. Nama produk di UI selalu "AegisOps".
6. **Tanpa data pribadi nyata.** Gunakan IP privat dan nama fiktif.
7. **Alutsista/OT = roadmap.** Jangan membangun fitur yang mengakses atau mengendalikan sistem senjata. Sebut hanya sebagai arah (diagnostik resmi dan diizinkan).

## 3. Cara bekerja

- **Kerja kecil dan bisa dijalankan.** Setiap langkah harus menghasilkan aplikasi yang tetap berjalan. Jangan meninggalkan state setengah rusak.
- **Satu fitur selesai > tiga fitur setengah.** Urutan ada di `TASKS.md`. Jangan loncat ke P1/P2 sebelum kriteria P0 lulus.
- **Pertahankan yang sudah ada.** Prototipe infrastruktur (ringkasan, alert, inventaris, prediksi, riwayat, 7 skenario) harus tetap berfungsi. Tambahkan, jangan menulis ulang dari nol kecuali diminta.
- **Fungsi murni untuk logika.** `detect()`, `correlate()`, `risk()` tidak menyentuh DOM. Ini memudahkan uji dan penjelasan ke juri.
- **Tanpa dependensi baru** kecuali benar-benar perlu. Prioritaskan JS murni dan ES modules. Bila perlu pustaka, pasang dengan versi tetap dan jelaskan alasannya.
- **Jangan over-engineer.** Tanpa backend, tanpa database, tanpa autentikasi untuk submission ini.
- **Tanyakan hanya bila terblokir.** Jika ada ambiguitas kecil, ambil keputusan yang paling konservatif, catat asumsi di `docs/DECISIONS.md` (buat bila belum ada), lalu lanjut.

## 4. Konvensi kode

- JavaScript ES2020+, modul ES, tanpa transpiler wajib. Tanpa `var` di kode baru.
- Nama: `camelCase` fungsi/variabel, `UPPER_SNAKE` konstanta, `kebab-case` nama berkas.
- ID aturan dan alert mengikuti `ARCHITECTURE.md` (`R-SCAN-01`, `AL-0001`, `INC-001`).
- Semua teks UI dalam bahasa Indonesia. Istilah teknis umum boleh Inggris.
- Escape semua string dinamis sebelum dimasukkan ke HTML (`esc()`), atau gunakan `textContent`.
- Jangan gunakan `alert()`, `confirm()`, `prompt()`. Buat konfirmasi di dalam UI.
- Render ulang jangan merusak interaksi: hindari mengganti DOM saat pointer ditekan atau `select` fokus (pola ini sudah ada di prototipe).
- Komentar hanya untuk "mengapa", bukan "apa".

## 5. Desain dan UI

- Pertahankan sistem desain prototipe: token warna di `:root`, tema gelap dan terang, font IBM Plex Sans/Mono, status semantik (ok/warn/crit/idle).
- Warna semantik terpisah dari warna aksen. Status tidak hanya dikodekan oleh warna (sertakan teks atau ikon).
- Tata letak: ringkasan dulu, detail kemudian. Hal yang butuh perhatian harus terlihat sekilas.
- Responsif sampai lebar ≈ 400 px; halaman tidak boleh scroll horizontal. Tabel dan diagram lebar boleh di dalam wadah `overflow-x: auto`.
- Hormati `prefers-reduced-motion`. Fokus keyboard harus terlihat.
- Setiap angka di dashboard harus bisa ditelusuri ke sumbernya (event, aset, atau rumus).

## 6. Pengujian

Minimal sebelum menyatakan sebuah tugas selesai:

1. Muat halaman, buka konsol: **tidak ada error** (error pemuatan font di lingkungan tanpa internet dapat diabaikan).
2. Jalankan skenario terkait dari awal sampai insiden ditutup.
3. Jalankan ulang skenario dengan seed sama: hasil harus identik.
4. Periksa lebar 1440 px dan 400 px, tema gelap dan terang.
5. Uji aturan di `tests/rules.test.js` untuk kasus: di bawah ambang (tidak ada alert), tepat di ambang, di atas ambang, dan eskalasi.

Jangan menyatakan "selesai" jika langkah 1–2 belum benar-benar dijalankan. Jika tidak bisa dijalankan, katakan apa yang belum diuji.

## 7. Definition of Done (per tugas)

- [ ] Perilaku sesuai PRD, termasuk kriteria penerimaan terkait
- [ ] Tidak ada regresi pada fitur yang ada
- [ ] Tidak ada error konsol
- [ ] Label simulasi tetap benar
- [ ] Catatan singkat pada `TASKS.md` (centang + 1 baris hasil)

## 8. Hal yang sebaiknya diminta pengguna, bukan ditebak

- Format dan durasi video/slide dari panitia
- URL hosting akhir dan akun yang dipakai
- Nama tim dan anggota untuk slide
- Data inventaris nyata (jika ada izin dan relevan)

## 9. Cara melaporkan hasil ke pengguna

Singkat dan jujur:
- Apa yang berubah (1–3 kalimat)
- Apa yang sudah diuji dan apa yang belum
- Keputusan atau asumsi yang diambil
- Langkah berikutnya yang paling masuk akal

Jangan merekap setiap langkah kerja. Jangan melebih-lebihkan.

## 10. Prompt awal yang disarankan untuk agent

> Baca `docs/PROJECT_CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, dan `AGENTS.md`. Mulai dari tugas P0 yang belum selesai di `TASKS.md` dengan urutan yang tertulis. Pertahankan prototipe yang sudah ada. Setelah setiap tugas, jalankan pengujian di bagian 6 dan centang tugas tersebut. Berhenti dan tanyakan jika ada keputusan yang tidak bisa dibalik.
