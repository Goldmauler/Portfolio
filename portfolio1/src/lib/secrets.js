import { useSyncExternalStore } from 'react';
import { toast } from './store';

// Visitor "secrets" — a light gamification layer. Progress lives in
// localStorage so returning visitors keep their unlocks.

export const SECRETS = [
  { id: 'terminal', name: 'Shell Access', hint: 'Run any command in the shell.' },
  { id: 'sudo', name: 'Privilege Escalation', hint: 'Ask nicely, as root.' },
  { id: 'robot', name: 'Robot Whisperer', hint: 'Poke the robot. A lot.' },
  { id: 'theme', name: 'Chameleon', hint: 'Change the color scheme.' },
  { id: 'quiz', name: 'Inner Circle', hint: 'Score 8+/10 in KNOW_VIMAL.exe.' },
  { id: 'firewall', name: 'Firewall', hint: 'Score 300+ in FIREWALL.exe.' },
  { id: 'life', name: 'Conway', hint: 'Bring the Game of Life to life.' },
  { id: 'decoder', name: 'Decoder Ring', hint: 'Decode the [B.64] block.' },
  { id: 'timestone', name: 'Sorcerer Supreme', hint: 'Name Vimal’s favourite Marvel character.' },
  { id: 'snap', name: 'Inevitable', hint: 'Hand over the Time Stone.' },
  { id: 'konami', name: 'God Mode', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
  { id: 'resume', name: 'Recruiter Mode', hint: 'Download the resume.' },
];

const KEY = 'vh-secrets';
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((id) => SECRETS.some((s) => s.id === id)) : [];
  } catch {
    return [];
  }
}

let unlocked = load();

export function unlock(id) {
  if (unlocked.includes(id)) return;
  const secret = SECRETS.find((s) => s.id === id);
  if (!secret) return;
  unlocked = [...unlocked, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(unlocked));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
  toast(`SECRET UNLOCKED · ${secret.name} [${unlocked.length}/${SECRETS.length}]`, 'secret');
}

export function resetSecrets() {
  unlocked = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export const getUnlocked = () => unlocked;

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useUnlocked() {
  return useSyncExternalStore(subscribe, getUnlocked, getUnlocked);
}
