# Institut NOKHBA — Inscription en ligne V01

Projet statique avec inscription en ligne et connexion Supabase.

## Supabase

1. Créez le projet Supabase.
2. Dans **SQL Editor**, exécutez `supabase/schema.sql`.
3. `supabase-config.js` contient le **Project URL** et la clé **anon public**. Ne mettez jamais `service_role` dans le site.

## Dashboard

Le formulaire public enregistre les pré-inscriptions dans `public.registrations`.
Le Dashboard (`admin.html`) utilise l’authentification Supabase et les policies `authenticated` du schéma pour consulter les inscriptions, changer leur statut et gérer le catalogue des matières.

Avant la première connexion, créez un utilisateur administrateur dans **Supabase → Authentication → Users → Add user**. Utilisez ensuite son email et son mot de passe dans `admin.html`.
