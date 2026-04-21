# VOCABULON

Application de flashcards pour apprendre l'anglais, depuis le français.

![Licence](https://img.shields.io/badge/Licence-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-purple.svg)

## Fonctionnalités

- 250 cartes de vocabulaire (6 mots chacune = 1500 mots)
- 100 cartes d'expressions (3 expressions chacune = 300 phrases)
- Prononciation audio en anglais pour tous les mots
- Mode sombre par défaut
- Authentification Google OAuth via Supabase
- Suivi de progression (cartes terminées)
- Interface multilingue (FR/EN)
- PWA (installation sur l'écran d'accueil mobile)
- Auto-hébergeable avec Docker

## Stack Technique

- **Frontend**: SvelteKit 5, Tailwind CSS v4
- **Backend**: Supabase (Auth + PostgreSQL)
- **Auth**: Google OAuth
- **Déploiement**: Docker, Caddy

## Installation

### Prérequis

- Node.js 20+
- npm

### Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Variables d'environnement

Créer un fichier `.env`:

```
PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## Déploiement

### Docker

```bash
docker compose up -d --build
```

### Build manuel

```bash
npm run build
node build
```

## Configuration Supabase

1. Créer un projet Supabase
2. Activer Google OAuth dans Authentication > Providers
3. Ajouter l'URL de redirect: `https://votre-domaine.com/auth/v1/callback`
4. Créer la table `user_card_progress`:

```sql
CREATE TABLE user_card_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);

CREATE OR REPLACE FUNCTION mark_card_done(u_id UUID, c_id TEXT)
RETURNS void AS $$
  INSERT INTO user_card_progress (user_id, card_id)
  VALUES (u_id, c_id)
  ON CONFLICT (user_id, card_id) DO NOTHING;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_card_undone(u_id UUID, c_id TEXT)
RETURNS void AS $$
  DELETE FROM user_card_progress WHERE user_id = u_id AND card_id = c_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_done_cards(u_id UUID)
RETURNS TABLE(card_id TEXT, created_at TIMESTAMPTZ) AS $$
  SELECT card_id, created_at FROM user_card_progress WHERE user_id = u_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

## Licence

MIT License - voir fichier [LICENSE](LICENSE).

## Auteur

[iesta](https://github.com/iesta)