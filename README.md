# 🐶🎓 Loulou Local — Fiches de Révision & Examens Blancs (v2.0)

Version enrichie et fidèle aux captures d'écran de l'application **Loulou Student** (`app.loulou-student.com`), conçue selon les principes de design **Hallmark** (interface soignée, sans slop générique, typographies de caractère, palettes équilibrées).

---

## ✨ Nouveautés & Fonctionnalités ajoutées

### 1. Prise en charge universelle des documents
* **PDF** : Extraction texte et structure page par page en local via PDF.js.
* **PowerPoint (.pptx)** : Décompression et lecture automatique des diapositives en local.
* **Word (.docx)** : Extraction du texte et des titres en local.
* **Photos & Images (.png, .jpg, .webp)** : Prise de notes manuscrites, photos de tableaux, schémas de cours analysés directement grâce au mode multimodal de l'IA.
* **Markdown & Fichiers texte (.md, .txt)** et copier-coller direct.

### 2. Le parcours de création officiel (Wizard 5 étapes)
1. **Étape 1 : Crée ton premier cours**
   * Choix parmi les **12 couleurs pastel officielles** (Terracotta, Vert clair, Bleu ciel, Lilas, Jaune doux, Pêche, Menthe, etc.).
   * Choix parmi les **33 icônes arrondis** (Cœur, Cerveau, Balance de justice, Calculatrice, ADN, Microscope, etc.).
2. **Étape 2 : Envoie ce que t'as**
   * Zone de glisser-déposer tout format avec compteur de mots en temps réel.
   * Bouton « Utiliser un document d'exemple » pré-chargé avec le cours officiel *« Le Cœur, double pompe »*.
3. **Étape 3 : Personnalise ta fiche (avec aperçu A4 interactif en direct)**
   * **8 Designs de page** :
     * *Quadrillé surligneur* (par défaut avec carreaux et marqueur)
     * *Cahier Seyès* (lignes d'écolier françaises avec marge rouge)
     * *Épuré* (papier blanc minimaliste)
     * *Carré* (bordures nettes et contraste moderne)
     * *Croquis* (fond à points et cadre technique)
     * *Post-it* (papier kraft et notes adhésives colorées)
     * *Pastel* (angles marshmallow et teintes douces)
     * *Aquarelle* (auréoles diffuses de couleur)
   * **7 Palettes de couleurs officielles** :
     * *Fluo classique* (Rose & Jaune fluo)
     * *Fluo jaune et bleu* (Bleu roi & Jaune fluo)
     * *Pastel menthe* (Vert forêt & Menthe)
     * *Pastel lilas* (Violet & Brume de lavande)
     * *Kraft* (Brun sépia & Ambre doré)
     * *Feutre seul* (Encre de chine & Ardoise)
     * *Fluo orange* (Mandarine & Pêche)
   * **Typographies officielles** :
     * Titres : *Amatic SC*, *Patrick Hand*, *Quicksand*, *Caveat*, *Comfortaa*, *Montserrat*, *Playfair Display*, *Fredoka*, *Indie Flower*, *Inter*.
     * Texte : *Quicksand*, *Patrick Hand*, *Inter*, *Lora*, *Caveat*.
   * **Interrupteur « Retirer le quadrillage »** : masque instantanément les carreaux ou lignes.
4. **Étape 4 : Animation Mascotte Chien Loulou**
   * Checklist en 4 étapes animées (*J'ouvre ton cours*, *Je trie l'essentiel*, *J'écris ta fiche*, *Je la mets en page*).
5. **Étape 5 : Fiche A4 paginée & Outils d'examen**
   * Cartouches de définition surlignés, encadrés d'attention (*⚠️ Pièges d'examen*), tableaux comparatifs et schémas.
   * **Examen Blanc chronométré** où chaque question cite textuellement le passage exact du cours dont elle provient.
   * **Flashcards 3D** avec animation *flip* et auto-évaluation.

### 3. Moteurs d'Intelligence Artificielle
* **Google Gemini API** (recommandé pour démarrer) :
  * Utilise votre clé gratuite Google AI Studio (`AIzaSy...`).
  * Analyse le texte ET les images (reconnaissance de schémas et notes manuscrites).
  * Prompts pédagogiques structurés respectant le format Loulou.
* **Ollama Local avec Détection Automatique** :
  * Cliquez sur le bouton **« Détecter »** dans les paramètres : l'application interroge automatiquement `http://localhost:11434` sur votre PC et remplit la liste déroulante avec les modèles trouvés (ex: `llama3`, `mistral`, `gemma`).
* **Moteur Heuristique 100% Hors-ligne** :
  * Fonctionne immédiatement sans clé, sans internet et sans serveur.

---

## 🌐 Comment partager sur GitHub pour y accéder depuis plusieurs appareils

### Option 1 : Déploiement en ligne avec GitHub Pages (Gratuit et accessible partout)
Comme cette application est constituée de technologies web modernes (HTML/CSS/JS), vous pouvez l'héberger gratuitement sur GitHub Pages en 2 minutes :

1. Allez sur **[github.com](https://github.com)** et connectez-vous (ou créez un compte).
2. Cliquez sur le bouton vert **« New »** pour créer un nouveau dépôt :
   * Nom du dépôt : par exemple `loulou-fiches`
   * Cochez **Public**
   * Cliquez sur **« Create repository »**.
3. Sur la page du dépôt, cliquez sur **« uploading an existing file »**.
4. Glissez-déposez l'ensemble des fichiers de ce dossier (`index.html`, `styles.css`, `app.js`, `README.md`, etc.).
5. Cliquez sur **« Commit changes »**.
6. Rendez-vous dans **Settings** (l'onglet du dépôt) > menu de gauche **Pages** :
   * Sous *Build and deployment*, dans **Branch**, choisissez `main` (ou `master`) et dossier `/(root)`.
   * Cliquez sur **Save**.
7. En moins d'une minute, GitHub vous donne un lien public sécurisé :
   👉 `https://<votre-pseudo>.github.io/loulou-fiches/`
   
**Vous pouvez ouvrir ce lien depuis votre téléphone, votre iPad, votre Mac ou n'importe quel PC !** Toutes vos fiches restent sauvegardées localement dans le navigateur de l'appareil utilisé.

---

### Option 2 : En réseau local chez vous (Wi-Fi de la maison)
Si vous souhaitez l'utiliser sur votre téléphone ou tablette sans internet :

1. Sur votre PC, ouvrez un terminal dans ce dossier et lancez :
   ```bash
   node server.js
   ```
2. Le terminal affiche automatiquement votre adresse réseau local :
   ```
   Sur mobile / tablette : http://192.168.1.XX:3000
   ```
3. Sur votre téléphone ou tablette connecté au même Wi-Fi, tapez simplement cette adresse dans Safari ou Chrome.
