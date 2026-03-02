# 🎨 Design System - Plateforme de Recrutement

## Identité Visuelle

### Palette de Couleurs

#### Couleurs Primaires
- **Primaire** : `#00427E` - Bleu professionnel et élégant
- **Primaire Claire** : `#0066CC` - Bleu moyen pour les hovers
- **Primaire Foncée** : `#002F5A` - Bleu très foncé pour les accents
- **Gradient Primaire** : `linear-gradient(135deg, #00427E 0%, #0066CC 100%)`

#### Couleurs d'Accent
- **Accent** : `#FF6B35` - Orange dynamique et moderne
- **Accent Claire** : `#FF8C61` - Orange clair
- **Accent Foncée** : `#E5522B` - Orange foncé

#### Couleurs Fonctionnelles
- **Succès** : `#20C997` - Vert turquoise pour les confirmations
- **Info** : `#00A8E8` - Bleu ciel pour les informations
- **Avertissement** : `#FFB800` - Jaune pour les alertes
- **Danger** : `#EF4444` - Rouge pour les erreurs

#### Couleurs Neutres
- **Neutral 900** : `#1F2937` - Texte principal
- **Neutral 800** : `#374151` - Texte secondaire
- **Neutral 700** : `#4B5563` - Texte tertiaire
- **Neutral 600** : `#6B7280` - Texte muted
- **Neutral 500** : `#9CA3AF` - Bordures
- **Neutral 400** : `#D1D5DB` - Bordures claires
- **Neutral 300** : `#E5E7EB` - Arrière-plans clairs
- **Neutral 200** : `#F3F4F6` - Arrière-plans très clairs
- **Neutral 100** : `#F9FAFB` - Arrière-plans de page
- **White** : `#FFFFFF` - Blanc pur

### Typographie

#### Polices
- **Headers** : `'Poppins', sans-serif` - Pour les titres (h1-h6)
- **Body** : `'Inter', sans-serif` - Pour le texte principal

#### Tailles
- **H1** : `3.5rem` (56px) - Hero titles
- **H2** : `2.75rem` (44px) - Section headers
- **H3** : `1.85rem` (29.6px) - Subsection headers
- **Body** : `1rem` (16px) - Texte principal
- **Small** : `0.875rem` (14px) - Texte secondaire

### Ombres

```css
--shadow-sm: 0 1px 2px rgba(0, 66, 126, 0.05);
--shadow-md: 0 4px 6px rgba(0, 66, 126, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 66, 126, 0.15);
--shadow-xl: 0 20px 25px rgba(0, 66, 126, 0.2);
```

### Espacements

- **Rayon de bordure** : 
  - Cards : `16-20px`
  - Buttons : `10-12px`
  - Inputs : `10px`
  - Badges : `25px`

### Effets et Animations

#### Transitions
- **Standard** : `0.3s ease`
- **Rapide** : `0.2s ease`
- **Lent** : `0.6s ease`

#### Hover Effects
- **Translate Y** : `-6px` pour les cards
- **Scale** : `1.05-1.1` pour les icônes
- **Brightness** : `1.1` pour les gradients

### Composants Principaux

#### Buttons
- **Primary** : Gradient bleu avec ombre
- **Outline** : Bordure bleue, fond transparent
- **Light** : Fond blanc, texte bleu
- **Danger** : Rouge pour les actions destructives

#### Cards
- Bordure arrondie `16-18px`
- Ombre subtile avec hover effects
- Bordure gauche colorée au hover
- Transition smooth `0.3s ease`

#### Forms
- Inputs avec fond gris clair
- Focus avec bordure bleu et ombre
- Labels en gras
- Messages d'erreur en rouge

#### Navigation
- Navbar avec gradient bleu
- Liens avec hover effects
- Sticky positioning
- Backdrop blur effect

### Responsive Design

#### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Accessibilité

- Contraste minimum WCAG AA
- Focus states visibles
- Tailles de texte lisibles
- Zones de clic suffisantes (min 44x44px)

## Utilisation

### Variables CSS
Toutes les couleurs sont définies comme variables CSS dans `index.css` :

```css
:root {
  --primary: #00427E;
  --primary-light: #0066CC;
  --accent: #FF6B35;
  /* ... */
}
```

### Classes Utilitaires
- `.btn-primary` - Bouton principal
- `.btn-outline` - Bouton outline
- `.badge` - Badge de statut
- `.card` - Carte de contenu
- `.alert-*` - Messages d'alerte

## Exemples d'Utilisation

### Button Primary
```jsx
<button className="btn btn-primary">
  Postuler maintenant
</button>
```

### Card avec Hover
```jsx
<div className="job-card">
  <h3>Titre du poste</h3>
  <p>Description...</p>
</div>
```

### Alert Success
```jsx
<div className="alert alert-success">
  Votre candidature a été envoyée avec succès !
</div>
```

---

**Design créé avec soin pour une expérience utilisateur moderne et professionnelle** ✨
