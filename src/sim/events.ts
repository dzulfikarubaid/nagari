import { cityName } from './personal';
import type { GameState, GameEvent, Fx } from './types';
import { applyFx, check, rand, addHistory, findNpc } from './core';
import { EVENTS_CORE } from '../content/events_core';
import { EVENTS_LIFE } from '../content/events_life';
import { EVENTS_PRES } from '../content/events_pres';
import { EVENTS_PERSONAL } from '../content/events_personal';

export const ALL_EVENTS: GameEvent[] = [...EVENTS_CORE, ...EVENTS_LIFE, ...EVENTS_PRES, ...EVENTS_PERSONAL];
export const EVENT_MAP: Record<string, GameEvent> = Object.fromEntries(ALL_EVENTS.map(e => [e.id, e]));

const COOLDOWN = 30;

/** Event terjadwal yang jatuh tempo masuk antrean; kalau syaratnya belum terpenuhi, ditunda. */
export function processScheduled(s: GameState) {
  const keep: typeof s.scheduled = [];
  for (const sc of s.scheduled) {
    if (sc.due > s.turn) { keep.push(sc); continue; }
    const ev = EVENT_MAP[sc.id];
    if (!ev) continue;
    if (s.char.jail > 0 || check(s, ev.when, sc.npcId) === false) {
      const tries = (sc.tries ?? 0) + 1;
      if (tries <= 10) keep.push({ ...sc, due: s.turn + 6, tries });
      continue;
    }
    if (sc.npcId && !findNpc(s, sc.npcId)) continue;
    if (s.pending.some(p => p.id === sc.id)) { keep.push({ ...sc, due: s.turn + 3 }); continue; }
    s.pending.push({ id: sc.id, npcId: sc.npcId, delayed: true });
  }
  s.scheduled = keep;
}

/** Undi satu event acak dari kolam yang memenuhi syarat. */
export function rollEvent(s: GameState) {
  if (s.char.jail > 0 || s.pending.length > 0) return;
  const p = s.campaign ? 0.6 : s.pres ? 0.5 : s.office ? 0.42 : 0.26;
  if (rand(s) > p) return;
  const pool: { ev: GameEvent; npcId?: string; w: number }[] = [];
  for (const ev of ALL_EVENTS) {
    if (!ev.weight) continue;
    const seen = s.seen[ev.id];
    if (seen !== undefined && (ev.once || s.turn - seen < COOLDOWN)) continue;
    const ok = check(s, ev.when);
    if (ok === false) continue;
    pool.push({ ev, npcId: typeof ok === 'string' ? ok : undefined, w: ev.weight });
  }
  if (!pool.length) return;
  let r = rand(s) * pool.reduce((a, b) => a + b.w, 0);
  for (const it of pool) {
    r -= it.w;
    if (r <= 0) { s.pending.push({ id: it.ev.id, npcId: it.npcId }); return; }
  }
}

export function eventText(s: GameState, text: string, npcId?: string): string {
  const n = findNpc(s, npcId);
  const c = s.char;
  return text.replace(/\$npc/g, n ? n.name : 'Seorang kenalan lama')
    .replace(/\$pasangan/g, c.partner ? c.partner.name : 'pasanganmu')
    .replace(/\$anak/g, c.children[0]?.name ?? 'anakmu')
    .replace(/\$kota/g, cityName(s));
}

/** Buang event terdepan yang tak punya satu pun pilihan yang bisa diambil, supaya permainan tidak macet. */
export function pruneDead(s: GameState) {
  while (s.pending.length) {
    const pe = s.pending[0];
    const ev = EVENT_MAP[pe.id];
    const rng = s.rng;
    const ok = !!ev && ev.choices.some(c => check(s, c.need, pe.npcId) !== false);
    s.rng = rng;
    if (ok) return;
    s.pending.shift();
  }
}

/** Pemain memilih salah satu opsi event terdepan. */
export function chooseEvent(s: GameState, index: number) {
  const pe = s.pending[0];
  if (!pe) return;
  const ev = EVENT_MAP[pe.id];
  if (!ev) { s.pending.shift(); return; }
  const ch = ev.choices[index];
  if (!ch || check(s, ch.need, pe.npcId) === false) return;
  s.pending.shift();
  s.seen[ev.id] = s.turn;
  const applied: Fx[] = [];
  let text = ch.result ?? '';
  if (ch.fx) { applyFx(s, ch.fx, pe.npcId); applied.push(ch.fx); }
  if (ch.outcomes && !s.ending) {
    let r = rand(s);
    for (const o of ch.outcomes) {
      r -= o.chance;
      if (r <= 0) { applyFx(s, o.fx, pe.npcId); applied.push(o.fx); text = o.text; break; }
    }
  }
  const title = eventText(s, ev.title, pe.npcId);
  addHistory(s, `${pe.delayed ? 'Akibat keputusan lama — ' : ''}${title}: ${ch.label}.`, pe.delayed ? 'akibat' : 'pilihan');
  s.result = { title, text: eventText(s, text || 'Keputusan diambil.', pe.npcId), fx: applied };
}
