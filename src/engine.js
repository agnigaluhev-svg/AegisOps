import { RULES } from './data.js';

export function detect(events, assets) {
  const findings = [];
  const knownIps = new Set(assets.map(a => a.ip));
  const knownMacs = new Set(assets.map(a => a.mac.toLowerCase()));
  const groups = new Map();
  for (const e of events) {
    if (!e.src_ip) continue;
    if (!groups.has(e.src_ip)) groups.set(e.src_ip, []);
    groups.get(e.src_ip).push(e);
  }
  for (const list of groups.values()) {
    const eventsBySource = [...list].sort((a, b) => a.ts.localeCompare(b.ts));
    const source = eventsBySource[0];
    if (eventsBySource.some(e => e.kind === 'conn' || e.kind === 'fw')) {
      const scanEvents = eventsBySource.filter(e => e.kind === 'conn' || e.kind === 'fw');
      for (let i = 0; i < scanEvents.length; i++) {
        const start = new Date(scanEvents[i].ts).getTime();
        const window = scanEvents.filter(e => new Date(e.ts).getTime() >= start && new Date(e.ts).getTime() <= start + 30_000);
        const ports = new Set(window.map(e => e.dst_port).filter(Boolean));
        const hosts = new Set(window.map(e => e.dst_ip).filter(Boolean));
        if (ports.size >= 15 || hosts.size >= 10) {
          const evidence = window.filter(e => ports.has(e.dst_port) || hosts.has(e.dst_ip));
          const targets = [...new Set(evidence.map(e => e.asset_id).filter(Boolean))];
          const allowed = evidence.some(e => e.action === 'allow');
          const critical = targets.some(id => (assets.find(a => a.id === id)?.criticality ?? 0) >= 4);
          findings.push({ rule: 'R-SCAN-01', src_ip: source.src_ip, title: 'Aktivitas port scanning terdeteksi', severity: allowed && critical ? 'crit' : 'warn', eventIds: evidence.map(e => e.id), targets, sources: [...new Set(evidence.map(e => e.source))], reason: `${ports.size} port unik diakses dalam jendela 30 detik dari sumber ${source.src_ip}. ${allowed ? 'Sebagian koneksi diizinkan firewall.' : 'Tidak ada koneksi yang diizinkan.'}`, recommendations: ['Verifikasi pemilik perangkat sumber dan konteks aktivitas.', 'Tinjau koneksi yang diizinkan serta aturan firewall terkait.', 'Pertimbangkan segmentasi setelah verifikasi operator.'] });
          break;
        }
      }
    }
    const authEvents = eventsBySource.filter(e => e.kind === 'auth');
    const authByService = new Map();
    for (const event of authEvents) { const service = event.service || 'auth'; if (!authByService.has(service)) authByService.set(service, []); authByService.get(service).push(event); }
    for (const [service, serviceEvents] of authByService) {
      let match = null;
      for (const startEvent of serviceEvents) {
        const start = new Date(startEvent.ts).getTime();
        const window = serviceEvents.filter(event => { const time = new Date(event.ts).getTime(); return time >= start && time <= start + 60_000; });
        const failures = window.filter(event => event.outcome === 'failure');
        if (failures.length >= 8) { match = { window, failures, successAfterFailures: window.some(event => event.outcome === 'success' && event.ts > failures[7].ts) }; break; }
      }
      if (match) {
        const evidence = match.window;
        const target = evidence.find(e => e.asset_id)?.asset_id;
        findings.push({ rule: 'R-BRUTE-01', src_ip: source.src_ip, title: 'Percobaan autentikasi SSH berulang', severity: match.successAfterFailures ? 'crit' : 'warn', eventIds: evidence.map(e => e.id), targets: target ? [target] : [], sources: [...new Set(evidence.map(e => e.source))], reason: `${match.failures.length} login gagal pada layanan ${service} dalam 60 detik${match.successAfterFailures ? ', diikuti login berhasil.' : '.'}`, recommendations: ['Verifikasi aktivitas login dan pemilik alamat sumber.', 'Tinjau akun terkait dan autentikasi pada server tujuan.', 'Ikuti prosedur respons akses organisasi; perubahan akses perlu persetujuan.'] });
        break;
      }
    }
    const newDevice = eventsBySource.find(e => e.kind === 'asset' && e.src_ip?.startsWith('10.0.') && (!knownIps.has(e.src_ip) || !knownMacs.has((e.src_mac || '').toLowerCase())));
    if (newDevice) findings.push({ rule: 'R-NEWDEV-01', src_ip: newDevice.src_ip, title: 'Perangkat baru terdeteksi di jaringan', severity: 'warn', eventIds: [newDevice.id], targets: [], sources: [newDevice.source], reason: `IP ${newDevice.src_ip} dan MAC ${newDevice.src_mac} belum tercatat di inventaris pada segmen terkelola.`, recommendations: ['Verifikasi identitas perangkat dan pemiliknya.', 'Periksa apakah perangkat seharusnya berada di segmen tersebut.', 'Perbarui inventaris setelah verifikasi.'] });
  }
  return dedupeFindings(findings);
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter(f => { const key = `${f.rule}|${f.src_ip}|${f.targets.join(',')}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

export function calculateRisk(finding, events, assets) {
  const targetAssets = finding.targets.map(id => assets.find(a => a.id === id)).filter(Boolean);
  const criticality = targetAssets.length ? Math.max(...targetAssets.map(a => a.criticality)) : 1;
  const allowed = finding.eventIds.some(id => events.find(e => e.id === id)?.action === 'allow');
  const sourceCount = new Set(finding.eventIds.map(id => events.find(e => e.id === id)?.source).filter(Boolean)).size;
  const base = finding.severity === 'crit' ? 50 : 30;
  const asset = 6 * criticality;
  const firewall = allowed ? 10 : 0;
  const corroboration = 8 * Math.max(0, sourceCount - 1);
  return { score: Math.max(0, Math.min(100, base + asset + firewall + corroboration)), breakdown: { base, asset_criticality: asset, fw_allowed: firewall, corroboration } };
}

export function correlate(finding, events, assets, id) {
  const risk = calculateRisk(finding, events, assets);
  const lastEventId = finding.eventIds[finding.eventIds.length - 1];
  return { id, rule: finding.rule, title: finding.title, severity: finding.severity, risk: risk.score, risk_breakdown: risk.breakdown, confidence: finding.sources.length > 1 ? 'tinggi' : finding.eventIds.length > 5 ? 'sedang' : 'rendah', t_first: events.find(e => e.id === finding.eventIds[0])?.ts || new Date().toISOString(), t_last: events.find(e => e.id === lastEventId)?.ts || new Date().toISOString(), sources: finding.sources, src: { ip: finding.src_ip, known: assets.some(a => a.ip === finding.src_ip) }, targets: finding.targets, impacted: [...new Set(finding.targets)], evidence_event_ids: finding.eventIds, why: finding.reason, recommendations: finding.recommendations, state: 'open' };
}

export { RULES };
