# ARCHITECTURE.md — AegisOps (target: submission Kartika Cyber Hackathon 2026)

## 1. Keputusan arsitektur untuk submission

**Tier A (wajib): aplikasi web statis tanpa backend.**
Seluruh pipeline (event → deteksi → korelasi → alert → insiden) berjalan di browser dengan event sintetis. Alasan: juri membuka satu URL tanpa instalasi, deploy 1 menit, tidak ada server yang bisa mati saat penjurian.

**Tier B (jika waktu cukup): pipeline nyata di VM lab, direkam untuk video.**
Suricata/Zeek memproses file pcap yang berisi lalu lintas **lab sendiri** → keluaran JSON → dikonversi ke skema event AegisOps → diputar di dashboard yang sama. Tujuannya membuktikan bahwa skema dan mesin deteksi sesuai keluaran sensor sungguhan.

Aturan: **Tier A harus selesai lebih dulu**. Jangan mulai Tier B sebelum Tier A lulus kriteria penerimaan di `PRD.md`.

## 2. Diagram alur

```
 [Sensor/Sumber]            [Normalisasi]        [Detection Engine]        [Korelasi]            [UI]
 Suricata eve.json ─┐
 Zeek conn/auth ────┤                         ┌─ R-SCAN-01
 Firewall syslog ───┼─► Event (skema §3) ───► ├─ R-BRUTE-01 ──► Finding ──► Alert (§4) ──► Alert Center
 SNMP / agen host ──┤   (di demo: scenario    ├─ R-NEWDEV-01        ▲           │              Event Analysis
 AegisNode (sim) ───┘    player + seed)       └─ R-HEALTH-*         │           ▼              Incident Mgmt
                                                                    │       Incident (§5)      Overview/Topology
                                                  Asset inventory ──┘
```

Di Tier A, blok "Sensor/Sumber" digantikan oleh **Scenario Player** yang menghasilkan event sintetis deterministik.

## 3. Skema event (ternormalisasi)

```json
{
  "id": "ev-000123",
  "ts": "2026-11-14T10:21:03.120Z",
  "source": "suricata | zeek | firewall | auth | snmp | agent | aegisnode",
  "kind": "conn | alert | fw | auth | health | asset",
  "src_ip": "10.0.3.45",
  "src_mac": "aa:bb:cc:dd:ee:ff",
  "dst_ip": "10.0.1.20",
  "dst_port": 22,
  "proto": "tcp",
  "action": "allow | deny | none",
  "outcome": "success | failure | none",
  "service": "ssh",
  "sig": null,
  "asset_id": "app-srv-01",
  "raw": { }
}
```

Aturan skema:
- `ts` selalu ISO 8601 UTC. Tampilkan dalam zona waktu pengguna di UI.
- `raw` menyimpan bentuk asli sumber (contoh: baris `eve.json`) agar detail event bisa dibuka.
- Event tidak boleh berisi data pribadi nyata. Gunakan IP rentang privat (`10.x`) dan nama perangkat fiktif.

## 4. Skema alert

```json
{
  "id": "AL-0007",
  "rule": "R-SCAN-01",
  "title": "Aktivitas port scanning terdeteksi",
  "severity": "warn | crit",
  "risk": 78,
  "risk_breakdown": { "base": 50, "asset_criticality": 24, "fw_allowed": 10, "corroboration": -6 },
  "confidence": "rendah | sedang | tinggi",
  "t_first": "ISO", "t_last": "ISO",
  "sources": ["zeek", "firewall"],
  "src": { "ip": "10.0.3.45", "known": false },
  "targets": ["app-srv-01"],
  "impacted": ["app-srv-01", "app-srv-02"],
  "evidence_event_ids": ["ev-000101", "ev-000102"],
  "why": "18 port unik diakses dalam 22 detik dari sumber yang tidak ada di inventaris.",
  "recommendations": ["...", "..."],
  "state": "open | auto | incident"
}
```

### Skor risiko (transparan, tampilkan rumusnya di UI)

```
risk = clamp( base(severity) + 6 × asset.criticality + (fw_allowed ? 10 : 0) + 8 × (jumlah_sumber_menguatkan − 1), 0, 100 )
base: peringatan = 30, kritis = 50
```
Parameter boleh disetel, tetapi harus tetap bisa dijelaskan dalam satu kalimat.

## 5. Skema insiden

```json
{
  "id": "INC-001",
  "alert_ids": ["AL-0007"],
  "status": "baru | dianalisis | ditangani | selesai | false_positive",
  "assignee": "Rian (Jaringan)",
  "notes": [ { "t": "ISO", "by": "string", "text": "string" } ],
  "timeline": [ { "t": "ISO", "x": "Insiden dibuat dari AL-0007" } ],
  "resolution": "string | null"
}
```

## 6. Detection Engine

- Fungsi murni: `detect(events, assets, config) → findings[]`. Tanpa efek samping, mudah diuji.
- Jendela bergulir per `src_ip`. Pertahankan struktur sederhana (Map + array), tanpa library.
- Setiap rule diekspor sebagai objek: `{ id, title, params, evaluate(ctx), explain(finding) }`.
- Deduplikasi: satu alert aktif per kombinasi `(rule, src_ip, target)`. Temuan baru memperbarui alert yang ada.
- Penutupan otomatis hanya untuk alert infrastruktur yang kembali normal. Alert keamanan **tidak** ditutup otomatis; operator yang memutuskan.

### Parameter default

| Rule | Parameter |
|---|---|
| R-SCAN-01 | `window=30s`, `min_unique_ports=15`, `min_unique_hosts=10` |
| R-BRUTE-01 | `window=60s`, `min_failures=8`, escalate jika ada `outcome=success` setelahnya |
| R-NEWDEV-01 | `managed_subnets=["10.0.0.0/16"]`, bandingkan IP/MAC dengan inventaris |

## 7. Scenario Player

- Skenario: `scan`, `brute`, `newdev`, `infra-*` (yang sudah ada). Masing-masing berupa fungsi yang menghasilkan array event dengan jadwal waktu relatif.
- PRNG ber-seed (mis. mulberry32) agar hasil identik setiap kali dijalankan.
- Kontrol: Jalankan, Jeda, Reset, kecepatan (1×/5×/10×).
- Latar belakang: traffic normal (koneksi web/DNS/NTP wajar) berjalan terus agar alert terlihat sebagai penyimpangan.

## 8. Struktur kode yang disarankan

Mulai dari satu file yang sudah ada, lalu pecah bila perlu. Tanpa framework, tanpa build step wajib.

```
aegisops/
├─ index.html
├─ src/
│  ├─ main.js                 # bootstrap, router (hash), render loop
│  ├─ state.js                # state tunggal: assets, events, alerts, incidents
│  ├─ assets.js               # inventaris + relasi topologi
│  ├─ scenarios/              # scan.js, brute.js, newdev.js, infra.js
│  ├─ engine/
│  │  ├─ detect.js            # orkestrasi aturan
│  │  ├─ rules.js             # R-SCAN-01, R-BRUTE-01, R-NEWDEV-01, R-HEALTH-*
│  │  ├─ correlate.js         # gabung event + aset + firewall → alert
│  │  └─ risk.js              # skor risiko
│  ├─ incidents.js            # siklus hidup insiden
│  ├─ views/                  # overview, network, threats, events, incidents, hardware, predictive
│  ├─ ui/                     # spark.js, ring.js, topo.js, toast.js
│  └─ styles.css              # token tema gelap/terang dari prototipe
├─ tools/
│  └─ convert-eve.js          # (Tier B) eve.json → skema event AegisOps
├─ docs/                      # file .md ini
└─ tests/
   └─ rules.test.js           # uji murni untuk detect()
```

## 9. Hosting

- **Utama:** hosting statis publik (Vercel, Netlify, atau GitHub Pages). Output = folder statis.
- **Cadangan:** satu host kedua + salinan lokal untuk final offline.
- Jangan memakai nama domain contoh sebagai fakta. Pastikan URL benar-benar terbuka sebelum dikirim.
- Font: boleh memakai Google Fonts dengan fallback sistem agar tetap terbaca bila font gagal dimuat.

## 10. Tier B: pipeline nyata (opsional)

1. VM lab (Linux) dengan Suricata dan/atau Zeek.
2. Ambil/generate pcap **dari lab sendiri** atau dataset publik yang berlisensi sesuai (sebutkan sumbernya di slide). Jangan memindai jaringan pihak lain.
3. Jalankan sensor pada pcap, hasilkan `eve.json` / log Zeek.
4. `tools/convert-eve.js` mengubah ke skema §3 dan menulis `scenarios/real-sample.json`.
5. Scenario Player memuat file itu. Mesin deteksi tidak berubah.
6. Rekam layar proses ini untuk video (30–45 detik).

## 11. Pertimbangan keamanan dan keandalan (untuk slide kelayakan)

- Sensor **pasif** (SPAN/TAP): tidak menjadi titik kegagalan jalur data.
- Agen server ringan, hanya baca. Mode air-gapped: data tidak keluar jaringan.
- Tindakan perubahan jaringan membutuhkan persetujuan operator (human-in-the-loop).
- Kontrol akses, audit log, dan segmentasi untuk lingkungan strategis = fase berikutnya (sebut sebagai roadmap).
