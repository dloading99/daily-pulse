// lib/linkedin.ts

// Stub per integrazione LinkedIn UGC Post (MVP)
// In produzione servirà un access token con scope w_member_social e chiamata reale all'API.

export async function publishToLinkedIn(
  accessToken: string,
  text: string,
  imageUrl?: string
): Promise<string> {
  if (!accessToken) {
    throw new Error('Missing LinkedIn Access Token');
  }

  console.log('Mock Publishing to LinkedIn...');
  console.log('Text:', text.substring(0, 80) + '...');
  console.log('Image:', imageUrl ?? 'none');

  // Simuliamo un minimo di latenza
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Fake URN di post
  return `urn:li:share:${Date.now()}`;
}
