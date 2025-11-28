'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InsightDTO } from '@/lib/types';
import TopNav from '../components/TopNav';

const USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID ??
  process.env.DEMO_USER_ID ??
  'demo-user';

interface InsightsResponse {
  insights: (InsightDTO & { pulse_score?: number })[];
  topicTitle?: string | null;
}

function mapInsight(raw: InsightDTO & { pulse_score?: number }): InsightDTO {
  return {
    ...raw,
    pulseScore: raw.pulseScore ?? raw.pulse_score ?? 0,
    published_date: raw.published_date ?? raw.date,
    summary_bullets: raw.summary_bullets ?? []
  };
}

export default function HomeDashboardPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<InsightDTO[]>([]);
  const [topicTitle, setTopicTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/insights', {
          headers: {
            'x-user-id': USER_ID
          }
        });

        if (!res.ok) {
          throw new Error('Impossibile recuperare gli insight');
        }

        const data = (await res.json()) as InsightsResponse;
        setInsights((data.insights || []).map(mapInsight));
        setTopicTitle(data.topicTitle ?? null);
      } catch (err) {
        console.error(err);
        setError('Non riusciamo a recuperare gli insight. Riprova.');
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0 || generating) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify({
          userId: USER_ID,
          insight_ids: selectedIds
        })
      });

      const payload = await res.json();
      if (!res.ok || !payload.draftId) {
        throw new Error(payload.error || 'Generazione non riuscita');
      }

      router.push(`/editor/${payload.draftId}`);
    } catch (err) {
      console.error(err);
      setError('Impossibile generare la bozza in questo momento.');
    } finally {
      setGenerating(false);
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const subtitle = useMemo(() => {
    if (topicTitle) {
      return `Tema del giorno: ${topicTitle}`;
    }
    if (loading) {
      return 'Carichiamo il tema del giorno...';
    }
    return 'Tema del giorno non disponibile';
  }, [loading, topicTitle]);

  return (
    <main>
      <TopNav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        <header style={{ marginBottom: 24 }}>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Daily Pulse</p>
          <h1 style={{ margin: '8px 0 4px', fontSize: 28 }}>Insight Deck</h1>
          <p style={{ color: '#374151', fontSize: 16, margin: 0 }}>{subtitle}</p>
        </header>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Caricamento insight in corso...</div>
      ) : insights.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          Nessun insight disponibile per oggi. Controlla il tema o riprova più tardi.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {insights.map((insight) => (
            <article
              key={insight.id}
              onClick={() => toggleSelection(insight.id!)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                boxShadow: isSelected(insight.id!)
                  ? '0 0 0 2px #2563eb'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                border: isSelected(insight.id!) ? '1px solid #2563eb' : '1px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#2563eb', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {insight.source}
                  </p>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, color: '#111827' }}>{insight.title}</h3>
                </div>
                <div
                  style={{
                    minWidth: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111827',
                    fontWeight: 700
                  }}
                >
                  {Math.round(insight.pulseScore)}
                </div>
              </div>
              <div style={{ color: '#374151', fontSize: 14 }}>
                <ul style={{ margin: '8px 0', paddingLeft: 18 }}>
                  {(insight.summary_bullets || []).map((bullet, idx) => (
                    <li key={`${insight.id}-bullet-${idx}`} style={{ marginBottom: 4 }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isSelected(insight.id!)}
                  onChange={() => toggleSelection(insight.id!)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ color: '#111827', fontSize: 14 }}>Usa questo insight</span>
              </div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 12 }}>
                Pulse score già ordinato. Seleziona fino a 3 insight.
              </p>
            </article>
          ))}
        </div>
      )}

        <footer style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={selectedIds.length === 0 || generating}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: selectedIds.length === 0 || generating ? '#9ca3af' : '#2563eb',
              color: '#fff',
              fontWeight: 600,
              cursor: selectedIds.length === 0 || generating ? 'not-allowed' : 'pointer',
              minWidth: 180
            }}
          >
            {generating ? 'Generazione...' : `Genera bozza (${selectedIds.length}/3)`}
          </button>
        </footer>
      </div>
    </main>
  );
}

