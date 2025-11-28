'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ImageAsset, PostDraft } from '@/lib/types';
import TopNav from '../../components/TopNav';

const USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID ??
  process.env.DEMO_USER_ID ??
  'demo-user';

type DraftResponse = PostDraft & { image_assets?: ImageAsset[] };

export default function EditorPage() {
  const params = useParams();
  const draftId = params?.id as string;
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const loadDraft = useCallback(async () => {
    if (!draftId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        headers: {
          'x-user-id': USER_ID
        }
      });

      const data = (await res.json()) as DraftResponse;
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Draft non trovato');
      }

      setDraft(data);
      setContent(data.edited_text ?? data.generated_text ?? '');
    } catch (err) {
      console.error(err);
      setMessage('Non riusciamo a caricare la bozza.');
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const saveDraft = async () => {
    if (!draftId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify({ edited_text: content })
      });

      const data = (await res.json()) as DraftResponse & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Salvataggio non riuscito');
      }

      setDraft(data);
      setMessage('Bozza salvata');
    } catch (err) {
      console.error(err);
      setMessage('Errore nel salvataggio. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const publishDraft = async () => {
    if (!draftId || draft?.status === 'published') return;
    setPublishing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify({ draftId, userId: USER_ID })
      });

      const payload = await res.json();
      if (res.status === 403) {
        setMessage('Collega LinkedIn per pubblicare.');
        return;
      }

      if (!res.ok) {
        throw new Error(payload.error || 'Errore di pubblicazione');
      }

      setDraft((prev) =>
        prev
          ? {
              ...prev,
              status: 'published',
              linkedin_post_id: payload.linkedinId ?? prev.linkedin_post_id,
              edited_text: content
            }
          : prev
      );
      setMessage('Pubblicato con successo su LinkedIn.');
    } catch (err) {
      console.error(err);
      setMessage('Pubblicazione non riuscita. Riprova più tardi.');
    } finally {
      setPublishing(false);
    }
  };

  const generateImage = async () => {
    if (!draftId) return;
    setImageLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/drafts/${draftId}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify({ userId: USER_ID })
      });

      const payload = await res.json();
      if (!res.ok || !payload.imageUrl) {
        throw new Error(payload.error || 'Impossibile generare immagine');
      }

      await loadDraft();
      setMessage('Immagine generata con successo.');
    } catch (err) {
      console.error(err);
      setMessage('Errore nella generazione immagine.');
    } finally {
      setImageLoading(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!draft) return 'Caricamento...';
    if (draft.status === 'published') return 'Pubblicato';
    if (draft.status === 'ready') return 'Pronto';
    return 'Bozza';
  }, [draft]);

  return (
    <main>
      <TopNav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Editor</p>
            <h1 style={{ margin: '6px 0 0', fontSize: 26 }}>Bozza LinkedIn</h1>
          </div>
          <span
            style={{
              padding: '6px 12px',
              background: draft?.status === 'published' ? '#d1fae5' : '#e5e7eb',
              borderRadius: 12,
              color: '#065f46',
              fontWeight: 600
            }}
          >
            {statusLabel}
          </span>
        </header>

        {message && (
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#312e81', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            {message}
          </div>
        )}

        {loading ? (
          <div>Caricamento bozza...</div>
        ) : !draft ? (
          <div style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            Bozza non trovata.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
            <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#111827' }}>Testo del post</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #d1d5db', padding: 12, fontSize: 15, lineHeight: 1.5 }}
              />
              <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: saving ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Salvataggio...' : 'Salva'}
                </button>
                <button
                  type="button"
                  onClick={publishDraft}
                  disabled={publishing || draft.status === 'published'}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: publishing || draft.status === 'published' ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: publishing || draft.status === 'published' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {draft.status === 'published' ? 'Già pubblicato' : publishing ? 'Pubblicazione...' : 'Pubblica su LinkedIn'}
                </button>
              </div>
              {draft.linkedin_post_id && (
                <p style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                  LinkedIn Post ID: {draft.linkedin_post_id}
                </p>
              )}
            </section>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Immagine</h3>
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={imageLoading || draft.status === 'published'}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: imageLoading || draft.status === 'published' ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: imageLoading || draft.status === 'published' ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {imageLoading ? 'Generazione...' : 'Genera immagine'}
                </button>
                {draft.image_assets && draft.image_assets.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 14 }}>Anteprima</p>
                    <img
                      src={draft.image_assets[0].url}
                      alt="Anteprima immagine"
                      style={{ width: '100%', borderRadius: 10, border: '1px solid #e5e7eb' }}
                    />
                  </div>
                ) : (
                  <p style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
                    Nessuna immagine generata.
                  </p>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Stato bozza</h3>
                <ul style={{ paddingLeft: 18, color: '#374151', margin: 0, fontSize: 14 }}>
                  <li>Stato attuale: {draft.status}</li>
                  <li>Azione di pubblicazione disabilitata se già pubblicato</li>
                  <li>Il salvataggio aggiorna il testo modificato</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

