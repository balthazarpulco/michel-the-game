// Classement en ligne sur Supabase (étape 4). Actif seulement si le build a VITE_SUPABASE_URL et
// VITE_SUPABASE_ANON_KEY (voir .env.example et supabase/schema.sql) ; sinon le jeu garde son classement local.
//
// Le jeu (ui/board.js) parle à une petite « db » : collection('scores').orderBy().limit().onSnapshot(cb, err)
// et collection('scores').doc().set(row). Cet adaptateur imite cette forme avec l'API REST de Supabase :
// lecture des 50 meilleurs scores de chaque mode, rafraîchie toutes les 45 s quand la page est visible.
export interface ScoreRow { name: string; score: number; stage: string | number; win: boolean; mode: string; at?: number }
interface Snap { docs: { id: string; data(): ScoreRow }[] }

const MODES = ['easy', 'medium', 'hard'];
const REFRESH = 45_000;

export function supabaseBoard(url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY) {
  if (!url || !key) return null;
  const api = url.replace(/\/$/, '') + '/rest/v1/scores';
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const listeners = new Set<(s: Snap) => void>();

  async function fetchAll(): Promise<Snap> {
    const lists = await Promise.all(MODES.map(async m => {
      const r = await fetch(`${api}?select=id,name,score,stage,win,mode,at&mode=eq.${m}&order=score.desc&limit=50`, { headers });
      if (!r.ok) throw new Error('supabase ' + r.status);
      return (await r.json()) as (ScoreRow & { id: number; at: string })[];
    }));
    return {
      docs: lists.flat().map(r => ({
        id: 's' + r.id,
        data: () => ({ name: r.name, score: r.score, stage: /^\d+$/.test(String(r.stage)) ? +r.stage : r.stage, win: r.win, mode: r.mode, at: Date.parse(r.at) }),
      })),
    };
  }
  async function refresh(err?: (e: unknown) => void) {
    try { const s = await fetchAll(); listeners.forEach(cb => cb(s)); } catch (e) { err?.(e); }
  }

  const query = {
    orderBy() { return query; },
    limit() { return query; },
    onSnapshot(cb: (s: Snap) => void, err?: (e: unknown) => void) {
      listeners.add(cb);
      refresh(err);
      const id = setInterval(() => { if (!document.hidden) refresh(); }, REFRESH);
      return () => { listeners.delete(cb); clearInterval(id); };
    },
  };
  return {
    kind: 'supabase' as const,
    collection(_name: string) {
      return {
        ...query,
        doc() {
          const ref = {
            id: '',
            async set(row: ScoreRow) {
              const r = await fetch(api + '?select=id', {
                method: 'POST', headers: { ...headers, Prefer: 'return=representation' },
                body: JSON.stringify({ name: row.name, score: Math.round(row.score), stage: String(row.stage), win: !!row.win, mode: row.mode }),
              });
              if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()));
              const [saved] = await r.json();
              ref.id = 's' + saved.id;
              refresh();
            },
          };
          return ref;
        },
      };
    },
  };
}
export type Board = NonNullable<ReturnType<typeof supabaseBoard>>;
