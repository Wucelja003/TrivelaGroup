/**
 * Redosled ulaska na landing: intro zavesa -> hero elementi -> dugmad.
 *
 * Bez ovoga su se hero animacije vrtele CSS-om odmah po mount-u, dakle
 * IZA intro zavese — i niko ih nije video. Sada svaka faza ceka prethodnu.
 */
export type Stage = "intro" | "hero";

const finished = new Set<Stage>();
const listeners = new Map<Stage, Set<() => void>>();

/** Nova poseta landingu — sve faze krecu ispocetka. */
export function resetSequence() {
  finished.clear();
}

export function markDone(stage: Stage) {
  if (finished.has(stage)) return;
  finished.add(stage);
  const subs = listeners.get(stage);
  if (subs) {
    // Kopija, jer se pretplatnici odjavljuju iz callback-a
    [...subs].forEach((cb) => cb());
    subs.clear();
  }
}

/** Pozove cb odmah ako je faza vec gotova; inace kad se zavrsi. */
export function onDone(stage: Stage, cb: () => void): () => void {
  if (finished.has(stage)) {
    cb();
    return () => {};
  }
  let subs = listeners.get(stage);
  if (!subs) {
    subs = new Set();
    listeners.set(stage, subs);
  }
  subs.add(cb);
  return () => subs.delete(cb);
}
