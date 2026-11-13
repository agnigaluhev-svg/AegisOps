# TASKS.md — Rencana kerja sampai pengumpulan (15 Nov 2026)

Aturan: kerjakan berurutan. Jangan mulai P1 sebelum seluruh P0 lulus. Centang dan tulis 1 baris hasil di setiap tugas.

Waktu acuan (WIB): Jum 13 Nov sore → Min 15 Nov pagi. Jam batas pengumpulan tidak tertulis, jadi **targetkan kirim Sabtu malam atau Minggu pagi**, bukan menit terakhir.

## Hari ini (Jum 13 Nov): fondasi

- [ ] **T0 — Konfirmasi ke panitia** (grup WhatsApp/dashboard CODEPOLITAN): format link, format dan durasi video, format slide, jam batas 15 Nov.
- [ ] **T0b — Daftar/login CODEPOLITAN**, buka form pengumpulan, catat kolom yang diminta.
- [x] **T1 — Siapkan repo** dengan struktur `ARCHITECTURE.md` §8; pindahkan prototipe yang ada, pastikan tetap berjalan. Folder hanya berisi dokumen; dibuat aplikasi statis baru.
- [x] **T2 — Tambah `state` keamanan**: `events[]`, `securityAlerts[]`, `incidents[]`, inventaris diperluas (IP, MAC, pemilik, segmen). State demo dan timeline disimpan di browser.
- [x] **T3 — Scenario Player** dengan PRNG ber-seed: skenario `scan` (A) dulu, dengan traffic latar normal. Ditambah brute, perangkat baru, dan telemetri UPS sintetis.
- [~] **T4 — Detection Engine**: `R-SCAN-01` + fungsi `detect()` murni + `tests/rules.test.js` untuk rule ini. Tiga rule dibuat; file uji otomatis belum dibuat/dijalankan.
- [x] **T5 — Korelasi + skor risiko**: gabung event + aset + firewall → alert dengan bukti, dampak, rekomendasi, rincian risiko.

**Checkpoint hari ini:** skenario A menghasilkan alert berbukti di UI.

## Sabtu (14 Nov): selesaikan alur dan kemas

- [x] **T6 — UI Cyber Threat Detection**: daftar alert keamanan, detail (bukti, dampak, risiko, rekomendasi), label "Data simulasi".
- [x] **T7 — UI Security Event Analysis**: tabel event dengan filter (sumber, aksi, IP), buka `raw`, sorot event bukti pada alert.
- [x] **T8 — Incident Management**: buat insiden dari alert, status, penugasan, catatan, timeline, false positive, penutupan.
- [~] **T9 — Skenario B (brute force) dan C (perangkat tak dikenal)** + uji unit rule `R-BRUTE-01`, `R-NEWDEV-01`. Skenario dibuat; uji unit belum dibuat/dijalankan.
- [x] **T10 — Sesuaikan Overview**: KPI keamanan (aset jaringan, alert keamanan, ketersediaan jaringan, alert perawatan), antrean prioritas gabungan keamanan + infrastruktur.
- [x] **T11 — Navigasi**: Overview, Network Monitoring, Cyber Threat Detection, Security Event Analysis, Hardware Health, Predictive Maintenance, Incident Management.
- [ ] **T12 — Pengujian lengkap** (AGENTS.md §6): konsol bersih, skenario A–D end-to-end, 1440 px dan 400 px, tema gelap/terang.
- [ ] **T13 — Deploy publik** ke hosting statis. Buka di incognito dan ponsel. Simpan URL.
- [ ] **T14 — Video demo** (lihat §Naskah). Rekam, tonton ulang.
- [ ] **T15 — Slide PDF** (lihat §Kerangka slide).

**Checkpoint Sabtu malam:** URL publik, video, dan slide siap diunggah.

## Minggu (15 Nov) pagi: kirim

- [ ] **T16 — Verifikasi akhir**: URL terbuka di incognito, video bisa diputar, PDF terbuka.
- [ ] **T17 — Unggah tiga item** di dashboard CODEPOLITAN. Screenshot bukti pengiriman.
- [ ] **T18 — Cadangan**: salinan kode, video, dan slide di dua tempat.

## Jika waktu cukup (P1, setelah P0 lulus)

- [ ] **P1a — Pipeline nyata (Tier B)**: Suricata/Zeek pada pcap lab → `convert-eve.js` → `real-sample.json`; rekam 30–45 dtk untuk video.
- [ ] **P1b — Hardware Health + Predictive** disatukan ke antrean prioritas (sudah ada; rapikan).
- [ ] **P1c — Tampilan laporan insiden** siap cetak (F12).

## Jika lolos Top 10 (20 Nov) → persiapan final 24 Nov

- [ ] Latih presentasi 10 menit (lihat kerangka slide).
- [ ] Pastikan demo berjalan **offline** di laptop sendiri; siapkan video cadangan.
- [ ] Siapkan jawaban Q&A (PRD §11).
- [ ] Rencana transportasi ke Hotel Aston Kartika, Jakarta (subsidi transport Rp500 ribu per tim dibayar di lokasi).

---

## Naskah video demo (target 3–5 menit)

| Waktu | Isi |
|---|---|
| 0:00–0:25 | Masalah: infrastruktur jaringan penting, gangguan dan serangan baru diketahui setelah dampak, alat terpisah-pisah |
| 0:25–0:50 | Solusi: AegisOps = deteksi + korelasi + prioritas + penanganan dalam satu platform. Sebut jelas bahwa demo memakai data simulasi |
| 0:50–1:20 | Tur singkat Overview: KPI, topologi, antrean prioritas |
| 1:20–2:50 | **Skenario A**: jalankan simulasi port scan → alert muncul → tunjukkan bukti, aset terdampak, skor risiko dan rumusnya, rekomendasi |
| 2:50–3:30 | **Incident Management**: ambil insiden, catatan, simulasikan mitigasi dengan persetujuan operator, tutup insiden, lihat timeline |
| 3:30–4:00 | **Skenario infrastruktur** (pendingin gagal atau UPS): satu platform untuk keamanan dan kesehatan perangkat; tunjukkan prediksi tren dengan keyakinan |
| 4:00–4:30 | Arsitektur (sensor pasif, Suricata/Zeek, agen, air-gapped) + roadmap (OT, aset pertahanan yang resmi dan diizinkan) |
| 4:30–5:00 | Penutup + URL |

Tips: rekam layar 1080p, suara jelas, jangan terburu-buru, tampilkan banner "Data simulasi" di layar.

## Kerangka slide (±10 slide, PDF)

1. Judul + tim + track (Penangkalan)
2. Masalah (konteks pertahanan: gangguan dan serangan pada infrastruktur jaringan; fakta, bukan klaim)
3. Solusi dan nilai (satu kalimat posisi)
4. Demo alur: deteksi → korelasi → alert → rekomendasi → insiden (tangkapan layar)
5. Detection Engine: rule, ambang, penjelasan alert, skor risiko transparan
6. Arsitektur: sensor pasif, normalisasi event, mesin deteksi, dashboard; mode air-gapped
7. Satu platform: keamanan + kesehatan perangkat + prediksi tren (dengan keyakinan)
8. Pengujian: skenario yang diuji, hasil, batasan (jujur: simulasi, apa yang sudah/belum diuji)
9. Kelayakan dan rencana implementasi: pilot, kebutuhan perangkat, risiko dan mitigasi (fail-safe, false positive, persetujuan operator)
10. Roadmap: pipeline nyata → predictive maintenance tervalidasi → OT/industri → aset pertahanan (diagnostik resmi) + penutup/kontak

## Catatan keputusan (isi saat bekerja)

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 13 Nov | Track Penangkalan (Defensive Shield) | Cocok dengan deteksi, pencegahan, respons |
| 13 Nov | Tier A tanpa backend; Tier B opsional | Waktu ±2 hari, juri butuh link tanpa instalasi |
