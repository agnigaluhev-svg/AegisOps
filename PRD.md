# PRD.md — AegisOps Cyber Defense Dashboard (Target: Kartika Cyber Hackathon 2026)

Versi: 1.0 · Status: siap dikerjakan · Batas pengumpulan: 15 Nov 2026

## 1. Tujuan

Mengumpulkan prototipe yang membuktikan satu alur nyata:

> **Traffic masuk → deteksi pola mencurigakan → korelasi dengan aset dan log firewall → alert berbukti → rekomendasi aman → insiden dikelola sampai selesai.**

Prototipe yang *berjalan* bernilai lebih tinggi daripada fitur yang banyak tetapi setengah jadi (fungsi prototipe = 25%).

### Bukan tujuan (untuk submission ini)
- Machine learning atau deteksi zero-day
- Integrasi hardware nyata sebagai syarat (ESP32/UPS cukup disimulasikan dan ditandai)
- Auto-blocking yang benar-benar mengubah jaringan
- Akses ke sistem kendali alutsista
- Multi-user, autentikasi, dan backend produksi

## 2. Pengguna

| Persona | Kebutuhan |
|---|---|
| **Operator NOC/SOC** (utama) | Tahu apa yang terjadi, seberapa serius, apa yang terdampak, dan apa yang diperiksa dulu |
| Administrator jaringan | Melihat kesehatan perangkat dan mengerti dampak gangguan |
| Komandan/pengambil keputusan | Ringkasan kondisi dan risiko dalam satu layar |
| Juri | Membuka link, memahami nilai produk dalam 2 menit, dan mencoba skenario sendiri |

## 3. Ruang lingkup fitur

Prioritas: **P0** wajib sebelum submit, **P1** jika waktu cukup, **P2** roadmap (cukup disebut di slide).

| ID | Fitur | P | Status |
|---|---|---|---|
| F1 | Overview dashboard (KPI, indeks kesehatan, topologi, antrean prioritas) | P0 | Ada (perlu penyesuaian KPI keamanan) |
| F2 | Network monitoring (latency, loss, bandwidth, status perangkat) | P0 | Ada |
| F3 | **Cyber Threat Detection**: mesin aturan di atas stream event | P0 | **Belum** |
| F4 | **Security Event Analysis**: daftar event, filter, detail event mentah | P0 | **Belum** |
| F5 | **Korelasi**: event + inventaris aset + keputusan firewall → satu alert | P0 | **Belum** |
| F6 | Alert berbukti + rekomendasi aman + skor risiko | P0 | Sebagian (ada untuk infrastruktur) |
| F7 | **Incident Management**: status, penugasan, catatan, penutupan | P0 | Sebagian (tiket infrastruktur) |
| F8 | Simulator skenario insiden (tombol memutar event sintetis) | P0 | Sebagian (7 skenario infrastruktur) |
| F9 | Hardware health (UPS, suhu ruang, AegisNode simulasi) | P1 | Ada |
| F10 | Predictive maintenance (tren + ETA + keyakinan) | P1 | Ada (regresi linear) |
| F11 | Pipeline nyata Suricata/Zeek dari pcap → JSON → dashboard | P1 | Belum |
| F12 | Ekspor laporan insiden (tampilan siap cetak) | P2 | Belum |
| F13 | OT/alutsista: telemetri diagnostik resmi | P2 | Roadmap |

## 4. Skenario demo utama

### Skenario A (inti): Port scanning dari perangkat tak dikenal
1. Operator membuka dashboard dalam kondisi normal (semua hijau).
2. Klik **Simulasi insiden → Port scan**. Event sintetis diputar: satu IP internal `10.0.3.45` menyentuh banyak port pada `app-srv-01` dalam 30 detik. Sebagian koneksi diizinkan firewall, sebagian ditolak.
3. **Detection Engine** menemukan pola (≥ 15 port unik dari satu sumber dalam 30 detik).
4. **Korelasi**: IP `10.0.3.45` tidak ada di inventaris (perangkat tak dikenal); target `app-srv-01` berkepentingan 4/5; firewall mengizinkan 3 koneksi ke port 22, 80, 443.
5. **Alert** tampil: waktu kejadian, sumber data, aset terdampak, skor risiko, bukti (daftar event), keyakinan.
6. **Rekomendasi** (aman): verifikasi pemilik perangkat, periksa port yang diizinkan, tinjau aturan firewall, pertimbangkan segmentasi. Tombol "Setujui isolasi" hanya **mensimulasikan** tindakan dan mencatatnya.
7. **Incident Management**: operator mengambil insiden, menambah catatan, menandai selesai atau false positive. Timeline tercatat.

### Skenario B: Brute force SSH
≥ 8 percobaan login gagal ke `db-srv-01` dari satu sumber dalam 60 detik, lalu satu login berhasil → severity naik ke **kritis**.

### Skenario C: Perangkat tidak dikenal masuk jaringan
Alamat MAC/IP baru muncul di segmen server dan tidak ada di inventaris → peringatan, rekomendasi verifikasi.

### Skenario D (diferensiasi): Gangguan infrastruktur
Skenario infrastruktur yang sudah ada (pendingin gagal, UPS menurun, switch mati). Tunjukkan satu skenario di video agar terlihat bahwa satu platform menangani keamanan **dan** kesehatan perangkat.

## 5. Kebutuhan fungsional (ringkas, dapat diuji)

**FR-1 Event stream.** Sistem memutar event ternormalisasi (skema di `ARCHITECTURE.md`) dengan kecepatan yang bisa dijeda dan di-reset. Skenario deterministik (seed tetap) agar demo bisa diulang.

**FR-2 Detection Engine.** Menjalankan aturan berikut dalam jendela waktu bergulir:

| Rule | Kondisi | Severity dasar |
|---|---|---|
| R-SCAN-01 | ≥ 15 port tujuan unik atau ≥ 10 host tujuan unik dari satu sumber dalam 30 dtk | Peringatan; kritis jika ada koneksi yang diizinkan ke aset kepentingan ≥ 4 |
| R-BRUTE-01 | ≥ 8 autentikasi gagal ke layanan yang sama dalam 60 dtk dari satu sumber | Peringatan; kritis jika diikuti login berhasil |
| R-NEWDEV-01 | IP/MAC tidak ada di inventaris muncul di segmen terkelola | Peringatan |
| R-HEALTH-* | Aturan infrastruktur yang sudah ada | Sesuai ambang |

Setiap rule wajib: ID, deskripsi, parameter yang dapat dijelaskan, dan alasan alert dalam bahasa manusia. Ambang ditampilkan di UI.

**FR-3 Korelasi.** Satu temuan menggabungkan event dengan `src_ip` sama dalam jendela waktu, memperkaya dengan data aset (nama, kepentingan, pemilik, relasi) dan keputusan firewall. Alert menampilkan jumlah sumber data yang saling menguatkan.

**FR-4 Skor risiko (0–100).** Dihitung dari severity dasar, kepentingan aset, apakah koneksi diizinkan firewall, dan jumlah sumber yang menguatkan. Rumus ditampilkan di UI agar transparan.

**FR-5 Alert.** Menampilkan: ID, waktu, sumber data, aset terdampak, perangkat lain yang terdampak, severity, skor risiko, bukti (event pendukung, bisa dibuka), keyakinan (rendah/sedang/tinggi), rekomendasi berurutan.

**FR-6 Incident Management.** Status: Baru → Dianalisis → Ditangani → Selesai (atau False positive). Penugasan, catatan bebas, timeline otomatis, dan hasil penanganan.

**FR-7 Label data.** Banner permanen "Data simulasi" + keterangan sumber data nyata yang akan dipakai (Suricata, Zeek, syslog firewall, SNMP, agen).

**FR-8 Tanpa instalasi.** Halaman publik, satu URL, bekerja di Chrome/Edge/Firefox terbaru dan layar ponsel.

## 6. Kebutuhan non-fungsional

- Waktu muat awal < 3 detik pada koneksi biasa; tanpa dependensi runtime selain font.
- Skenario berjalan stabil minimal 10 menit tanpa error konsol.
- Bahasa UI: Indonesia. Istilah teknis (alert, event, firewall) boleh Inggris.
- Aksesibilitas dasar: kontras cukup di tema gelap dan terang, fokus keyboard terlihat, tidak bergantung warna saja.
- Tidak ada `alert()/confirm()`; konfirmasi dibuat di dalam halaman.

## 7. Kriteria penerimaan (Definition of Done untuk submission)

- [ ] Skenario A, B, C dapat dijalankan dari awal sampai insiden selesai tanpa error
- [ ] Setiap alert menampilkan bukti, dampak, skor risiko dan rekomendasi
- [ ] Insiden dapat diambil, diberi catatan, dan ditutup; timeline tersimpan selama sesi
- [ ] Skenario infrastruktur lama tetap berfungsi (tidak ada regresi)
- [ ] Banner "Data simulasi" terlihat di semua halaman
- [ ] URL publik dapat dibuka di jendela incognito dan di ponsel
- [ ] Video demo selesai dan ditonton ulang tanpa kesalahan
- [ ] Slide PDF selesai
- [ ] Tiga item sudah diunggah di dashboard CODEPOLITAN sebelum batas waktu

## 8. Pemetaan ke kriteria juri

| Kriteria | Bukti di prototipe |
|---|---|
| Relevansi (25%) | Deteksi dan respons pada jaringan; kerangka IT/OT; sektor pertahanan sebagai target (roadmap alutsista) |
| Inovasi (25%) | Korelasi event + aset + firewall; skor risiko transparan; satu platform keamanan + kesehatan perangkat |
| Fungsi prototipe (25%) | Skenario A–D berjalan end-to-end |
| Kelayakan (15%) | Arsitektur sensor pasif + agen ringan; jalur Suricata/Zeek nyata; deploy lokal/air-gapped; mode fail-safe |
| Dokumentasi (10%) | Link bersih, video terstruktur, slide ringkas |

## 9. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Waktu sangat singkat (≈ 2 hari) | Kerjakan hanya P0. P1/P2 cukup disebut |
| Juri menganggap "hanya simulasi" | Sebut jelas di slide dan video; tunjukkan skema event yang identik dengan keluaran Suricata/Zeek; jika sempat, rekam pipeline nyata (F11) |
| Klaim berlebihan | Ikuti `PROJECT_CONTEXT.md` §5 |
| Link tidak bisa dibuka juri | Uji di incognito dan ponsel; siapkan cadangan (dua host) |
| Format submission tidak jelas | Tanyakan panitia hari ini |

## 10. Roadmap singkat (untuk slide)

1. **Fase 1 (kompetisi):** Cyber Defense Dashboard + Network Threat Detection (simulasi event)
2. **Fase 2:** Pipeline nyata Suricata/Zeek, agen server, SNMP, AegisNode ESP32-S3
3. **Fase 3:** Predictive maintenance tervalidasi dengan data historis
4. **Fase 4:** Integrasi keamanan lanjutan (threat intel, korelasi lebih dalam)
5. **Fase 5:** OT/industri dan diagnostik aset pertahanan yang resmi dan diizinkan

## 11. Rencana final (jika lolos Top 10)

Presentasi 10 menit + demo tatap muka di Jakarta, 24 Nov. Siapkan: skenario A langsung di laptop (offline-capable), cadangan video, dan jawaban untuk pertanyaan: *apa bedanya dengan Wazuh/Security Onion/Zabbix, bagaimana false positive ditangani, bagaimana dipasang di jaringan tertutup, apa yang terjadi jika gateway/sensor gagal.*
