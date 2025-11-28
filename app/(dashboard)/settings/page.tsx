'use client';

import { useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav';
import type { Profile, Topic } from '@/lib/types';

interface TopicRow {
  id?: string;
  title: string;
  day_of_week: number;
  is_active: boolean;
}

const DAYS = [
  'Domenica (0)',
  'Lunedì (1)',
  'Martedì (2)',
  'Mercoledì (3)',
  'Giovedì (4)',
  'Venerdì (5)',
  'Sabato (6)'
];

const USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID ??
  process.env.DEMO_USER_ID ??
  'demo-user';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    role: '',
    sector: '',
    objective: '',
    language: '',
    linkedin_access_token: ''
  });
  const [topics, setTopics] = useState<TopicRow[]>(
    Array.from({ length: 7 }).map((_, idx) => ({ day_of_week: idx, title: '', is_active: false }))
  );
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [topicsStatus, setTopicsStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', { headers: { 'x-user-id': USER_ID } });
        const data = (await res.json()) as { profile: Profile | null };
        if (res.ok && data.profile) {
          setProfile({ ...data.profile });
        }
      } catch (err) {
        console.error('Profile fetch error', err);
      }
    }

    async function loadTopics() {
      try {
        const res = await fetch('/api/topics', { headers: { 'x-user-id': USER_ID } });
        const data = (await res.json()) as { topics: Topic[] };
        if (res.ok && data.topics) {
          setTopics((prev) => {
            const mapped = Array.from({ length: 7 }).map((_, idx) => {
              const existing = data.topics.find((t) => t.day_of_week === idx);
              return existing
                ? { id: existing.id, title: existing.title, day_of_week: existing.day_of_week, is_active: existing.is_active }
                : { ...prev[idx], day_of_week: idx };
            });
            return mapped;
          });
        }
      } catch (err) {
        console.error('Topics fetch error', err);
      }
    }

    loadProfile();
    loadTopics();
  }, []);

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleTopicChange = (index: number, key: keyof TopicRow, value: string | boolean) => {
    setTopics((prev) => prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)));
  };

  const saveProfile = async () => {
    setProfileStatus(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify(profile)
      });

      if (!res.ok) {
        throw new Error('Errore nel salvataggio del profilo');
      }

      const data = (await res.json()) as { profile?: Profile; error?: string };
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.profile) {
        setProfile({ ...data.profile });
      }

      setProfileStatus('Profilo salvato con successo');
    } catch (err) {
      console.error(err);
      setProfileStatus('Errore nel salvataggio del profilo');
    }
  };

  const saveTopics = async () => {
    setTopicsStatus(null);
    try {
      const payload = { topics: topics.map((t) => ({
        id: t.id,
        title: t.title || '',
        day_of_week: t.day_of_week,
        is_active: t.is_active
      })) };

      const res = await fetch('/api/topics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID
        },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as { topics?: Topic[]; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Errore nel salvataggio dei topics');
      }

      if (data.topics) {
        setTopics((prev) =>
          Array.from({ length: 7 }).map((_, idx) => {
            const existing = data.topics?.find((t) => t.day_of_week === idx);
            return existing
              ? { id: existing.id, title: existing.title, day_of_week: existing.day_of_week, is_active: existing.is_active }
              : { ...prev[idx], day_of_week: idx };
          })
        );
      }

      setTopicsStatus('Topics salvati con successo');
    } catch (err) {
      console.error(err);
      setTopicsStatus('Errore nel salvataggio dei topics');
    }
  };

  const profileFields = useMemo(
    () => [
      { key: 'full_name' as const, label: 'Nome completo', placeholder: 'Mario Rossi' },
      { key: 'role' as const, label: 'Ruolo', placeholder: 'Marketing Manager' },
      { key: 'sector' as const, label: 'Settore', placeholder: 'Tecnologia' },
      { key: 'objective' as const, label: 'Obiettivo', placeholder: 'Aumentare le lead' },
      { key: 'language' as const, label: 'Lingua', placeholder: 'it' }
    ],
    []
  );

  return (
    <main>
      <TopNav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <header>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Daily Pulse</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 28 }}>Impostazioni</h1>
        </header>

        <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 20 }}>Profilo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {profileFields.map((field) => (
              <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#111827' }}>
                <span style={{ fontWeight: 600 }}>{field.label}</span>
                <input
                  type="text"
                  value={(profile[field.key] as string) || ''}
                  onChange={(e) => handleProfileChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 10 }}
                />
              </label>
            ))}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#111827', marginTop: 12 }}>
            <span style={{ fontWeight: 600 }}>Token LinkedIn</span>
            <textarea
              value={profile.linkedin_access_token || ''}
              onChange={(e) => handleProfileChange('linkedin_access_token', e.target.value)}
              rows={3}
              style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 10 }}
            />
          </label>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={saveProfile}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Salva profilo
            </button>
            {profileStatus && (
              <span style={{ marginLeft: 12, color: '#111827', fontSize: 14 }}>{profileStatus}</span>
            )}
          </div>
        </section>

        <section style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 20 }}>Topics settimanali</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {topics.map((topic, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{DAYS[idx]}</p>
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(idx, 'title', e.target.value)}
                  placeholder="Titolo del topic"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: 8, marginBottom: 8 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
                  <input
                    type="checkbox"
                    checked={topic.is_active}
                    onChange={(e) => handleTopicChange(idx, 'is_active', e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span>Attivo</span>
                </label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={saveTopics}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Salva topics
            </button>
            {topicsStatus && <span style={{ marginLeft: 12, color: '#111827', fontSize: 14 }}>{topicsStatus}</span>}
          </div>
        </section>
      </div>
    </main>
  );
}
