import { Profile } from '../types/database';

function escapeVCardValue(value: string): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .trim();
}

export function generateVCard(profile: Profile): string {
  const profileUrl = `https://profile.dj/${encodeURIComponent(profile.username)}`;

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  const lastName = escapeVCardValue(profile.last_name || '');
  const firstName = escapeVCardValue(profile.first_name || '');
  lines.push(`N:${lastName};${firstName};;;`);

  const fullName = escapeVCardValue(
    profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username
  );
  lines.push(`FN:${fullName}`);

  if (profile.headline && profile.headline.trim()) {
    lines.push(`TITLE:${escapeVCardValue(profile.headline)}`);
  }

  if (profile.phone && profile.phone.trim()) {
    lines.push(`TEL;TYPE=CELL,VOICE:${profile.phone.trim()}`);
  }

  if (profile.whatsapp && profile.whatsapp.trim() && profile.whatsapp.trim() !== profile.phone?.trim()) {
    lines.push(`TEL;TYPE=WORK,VOICE:${profile.whatsapp.trim()}`);
  }

  if (profile.email && profile.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${profile.email.trim()}`);
  }

  if (profile.website && profile.website.trim()) {
    lines.push(`URL:${profile.website.trim()}`);
  }

  if (profile.location && profile.location.trim()) {
    lines.push(`ADR;TYPE=WORK:;;;${escapeVCardValue(profile.location)};;;`);
  }

  if (profile.bio && profile.bio.trim()) {
    lines.push(`NOTE:${escapeVCardValue(profile.bio)}`);
  }

  lines.push(`URL;TYPE=PROFILE:${profileUrl}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(profile: Profile): void {
  const vcardText = generateVCard(profile);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${profile.username.toLowerCase()}-contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
