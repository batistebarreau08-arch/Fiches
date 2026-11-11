/**
 * ===================================================================
 * LOULOU LOCAL - Fiches de Révision & Examens Blancs (v2.0)
 * Design conforme aux captures d'écran de app.loulou-student.com
 * Moteurs : Gemini API (Multimodal), Ollama Auto-détecté & Local
 * ===================================================================
 */

// 1. ÉTAT GLOBAL
const STORAGE_COURSES = 'loulou_v2_courses';
const STORAGE_SETTINGS = 'loulou_v2_settings';

const state = {
  courses: [],
  currentCourseId: null,
  activeExam: null,
  activeFlashcards: {
    cards: [],
    currentIndex: 0,
    isFlipped: false
  },
  wizard: {
    title: 'Le Cœur, double pompe',
    subject: 'SVT · Physiologie humaine',
    color: '#f3d2c9',
    icon: 'heart',
    rawText: '',
    imageFiles: [],
    scope: 'Chapitre 1 - Anatomie et fonctionnement',
    design: 'quadrille',
    palette: 'fluo-jaune-bleu',
    fontTitle: "'Amatic SC', cursive",
    fontBody: "'Quicksand', sans-serif",
    noGrid: false
  },
  settings: {
    engine: 'gemini', // 'gemini' | 'ollama' | 'heuristic'
    geminiKey: '',
    ollamaModel: 'llama3'
  }
};

// 12 Couleurs Pastels officielles de Loulou (Capture 182142.png)
const LOULOU_PASTELS = [
  { name: 'Terracotta', hex: '#f3d2c9' },
  { name: 'Vert clair', hex: '#dcebd8' },
  { name: 'Bleu ciel', hex: '#d7e4ed' },
  { name: 'Lilas', hex: '#ebddf0' },
  { name: 'Jaune doux', hex: '#f9eac6' },
  { name: 'Pêche', hex: '#f8e0ce' },
  { name: 'Menthe', hex: '#ceefe6' },
  { name: 'Gris bleuté', hex: '#d8e2e6' },
  { name: 'Rose bonbon', hex: '#f7d7e3' },
  { name: 'Olive doux', hex: '#e1eacd' },
  { name: 'Bleu lavande', hex: '#dfe3f7' },
  { name: 'Beige doux', hex: '#efe0d2' }
];

// 33 Icônes officielles (Capture 182142.png)
const LOULOU_ICONS = [
  'heart', 'activity', 'brain', 'lungs', 'gavel', 'scale', 'shield', 'landmark', 'trending-up', 'bar-chart', 'calculator',
  'function-square', 'flask-conical', 'flask-round', 'microscope', 'dna', 'pill', 'lightbulb', 'users', 'graduation-cap', 'globe', 'languages',
  'atom', 'palette', 'compass', 'code', 'cpu', 'leaf', 'music', 'trophy', 'book-open', 'school', 'sparkles'
];

// INITIALISATION AU CHARGEMENT
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  renderColorPicker();
  renderIconGrid();
  renderDashboard();
  updateLivePreview();
  lucide.createIcons();

  // Détection automatique passive Ollama si sélectionné
  if (state.settings.engine === 'ollama') {
    detectOllamaModels(false);
  }
});

// CHARGEMENT & SAUVEGARDE
function loadStoredData() {
  try {
    const savedCourses = localStorage.getItem(STORAGE_COURSES);
    if (savedCourses) {
      state.courses = JSON.parse(savedCourses);
    }

    const savedSettings = localStorage.getItem(STORAGE_SETTINGS);
    if (savedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }

    // Synchroniser l'UI des paramètres
    const keyInput = document.getElementById('input-gemini-key');
    if (keyInput && state.settings.geminiKey) keyInput.value = state.settings.geminiKey;

    const radio = document.querySelector(`input[name="settings-engine"][value="${state.settings.engine}"]`);
    if (radio) radio.checked = true;

    updateActiveModelBadge();

    // Si aucune fiche, charger la démo
    if (state.courses.length === 0) {
      loadSampleHeartCourse(false);
    } else {
      state.currentCourseId = state.courses[0].id;
    }
  } catch (err) {
    console.error('Erreur chargement données:', err);
  }
}

function saveCourses() {
  localStorage.setItem(STORAGE_COURSES, JSON.stringify(state.courses));
}

function saveSettings() {
  const selectedRadio = document.querySelector('input[name="settings-engine"]:checked');
  if (selectedRadio) state.settings.engine = selectedRadio.value;

  const keyInput = document.getElementById('input-gemini-key');
  if (keyInput) state.settings.geminiKey = keyInput.value.trim();

  const ollamaSelect = document.getElementById('select-ollama-models');
  if (ollamaSelect) state.settings.ollamaModel = ollamaSelect.value;

  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(state.settings));
  updateActiveModelBadge();
  closeSettingsModal();
  alert('Paramètres enregistrés avec succès !');
}

function updateActiveModelBadge() {
  const badge = document.getElementById('active-model-badge');
  if (!badge) return;
  if (state.settings.engine === 'gemini') {
    badge.textContent = state.settings.geminiKey ? 'IA : Gemini Flash (Actif)' : 'IA : Gemini (Clé requise)';
  } else if (state.settings.engine === 'ollama') {
    badge.textContent = `IA : Ollama (${state.settings.ollamaModel})`;
  } else {
    badge.textContent = 'IA : Local Heuristique';
  }
}

// NAVIGATION ENTRE VUES
function hideAllViews() {
  const views = [
    'wizard-step-1', 'wizard-step-2', 'wizard-step-3',
    'view-dashboard', 'view-final-sheet', 'view-exam', 'view-flashcards'
  ];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.add('hidden');
  });

  const navBtns = ['nav-btn-home', 'nav-btn-new', 'nav-btn-exam', 'nav-btn-flashcards'];
  navBtns.forEach(b => {
    const el = document.getElementById(b);
    if (el) {
      el.classList.remove('bg-white', 'text-stone-900', 'shadow-xs');
      el.classList.add('text-stone-600');
    }
  });
}

function showDashboard() {
  hideAllViews();
  const el = document.getElementById('view-dashboard');
  if (el) el.classList.remove('hidden');

  const btn = document.getElementById('nav-btn-home');
  if (btn) {
    btn.classList.add('bg-white', 'text-stone-900', 'shadow-xs');
    btn.classList.remove('text-stone-600');
  }

  renderDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

function startWizard() {
  goToWizardStep(1);
}

function goToWizardStep(stepNumber) {
  hideAllViews();
  const el = document.getElementById(`wizard-step-${stepNumber}`);
  if (el) el.classList.remove('hidden');

  if (stepNumber === 1) {
    const btn = document.getElementById('nav-btn-new');
    if (btn) {
      btn.classList.add('bg-white', 'text-stone-900', 'shadow-xs');
      btn.classList.remove('text-stone-600');
    }
  } else if (stepNumber === 3) {
    updateLivePreview();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

// WIZARD ÉTAPE 1 : COULEURS & ICÔNES
function renderColorPicker() {
  const container = document.getElementById('course-color-selector');
  if (!container) return;
  container.innerHTML = '';

  LOULOU_PASTELS.forEach((c, idx) => {
    const circle = document.createElement('button');
    circle.type = 'button';
    circle.className = `w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${idx === 0 ? 'border-stone-800 ring-2 ring-stone-300' : 'border-transparent'}`;
    circle.style.backgroundColor = c.hex;
    circle.title = c.name;
    circle.onclick = () => {
      document.querySelectorAll('#course-color-selector button').forEach(b => {
        b.className = 'w-7 h-7 rounded-full border-2 border-transparent transition-transform hover:scale-110';
      });
      circle.className = 'w-7 h-7 rounded-full border-2 border-stone-800 ring-2 ring-stone-300 scale-110';
      state.wizard.color = c.hex;
    };
    container.appendChild(circle);
  });
}

function renderIconGrid() {
  const grid = document.getElementById('course-icon-grid');
  if (!grid) return;
  grid.innerHTML = '';

  LOULOU_ICONS.forEach((iconName, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `w-8 h-8 rounded-xl border flex items-center justify-center transition hover:border-stone-400 ${idx === 0 ? 'bg-amber-100/70 border-amber-400 text-amber-900' : 'bg-white border-stone-200 text-stone-600'}`;
    btn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
    btn.title = iconName;
    btn.onclick = () => {
      document.querySelectorAll('#course-icon-grid button').forEach(b => {
        b.className = 'w-8 h-8 rounded-xl border bg-white border-stone-200 text-stone-600 hover:border-stone-400';
      });
      btn.className = 'w-8 h-8 rounded-xl border bg-amber-100/70 border-amber-400 text-amber-900';
      state.wizard.icon = iconName;
    };
    grid.appendChild(btn);
  });
}

// WIZARD ÉTAPE 2 : FICHIERS MULTI-FORMATS
async function handleWizardFiles(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const statusEl = document.getElementById('wizard-file-status');
  const textInput = document.getElementById('wizard-text-input');
  statusEl.textContent = `Lecture de ${files.length} fichier(s)...`;

  let accumulatedText = textInput.value ? textInput.value + '\n\n' : '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'pdf') {
        accumulatedText += await extractTextFromPdf(file);
      } else if (ext === 'pptx') {
        accumulatedText += await extractTextFromPptx(file);
      } else if (ext === 'docx') {
        accumulatedText += await extractTextFromDocx(file);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        accumulatedText += `\n[Image jointe : ${file.name}]\n`;
        const base64 = await fileToBase64(file);
        state.wizard.imageFiles.push({ name: file.name, base64: base64, type: file.type });
      } else {
        // Fichier texte brut ou Markdown
        accumulatedText += await file.text();
      }
    } catch (err) {
      console.error(`Erreur lecture ${file.name}:`, err);
    }
  }

  textInput.value = accumulatedText.trim();
  updateWizardWordCount();
  statusEl.textContent = `Fichier(s) prêt(s) (${files.length} chargé(s))`;

  // Pré-remplir le titre si vide
  const titleInput = document.getElementById('wizard-course-title');
  if (titleInput && (!titleInput.value || titleInput.value.includes('Le Cœur'))) {
    titleInput.value = files[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  }
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = `=== Extrait PDF : ${file.name} ===\n`;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str).join(' ');
    fullText += strings + '\n\n';
  }
  return fullText;
}

// Extraction PowerPoint (.pptx) via JSZip en local
async function extractTextFromPptx(file) {
  const zip = await JSZip.loadAsync(file);
  let pptxText = `=== Diapositives PowerPoint : ${file.name} ===\n`;

  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  slideFiles.sort();

  for (let slidePath of slideFiles) {
    const xmlContent = await zip.files[slidePath].async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("a:t");

    let slideStrings = [];
    for (let t of textNodes) {
      slideStrings.push(t.textContent);
    }
    if (slideStrings.length > 0) {
      pptxText += `\n--- Diapositive ---\n` + slideStrings.join(' ') + '\n';
    }
  }
  return pptxText;
}

// Extraction Word (.docx) via JSZip
async function extractTextFromDocx(file) {
  const zip = await JSZip.loadAsync(file);
  if (!zip.files['word/document.xml']) return '';
  const xmlContent = await zip.files['word/document.xml'].async('string');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const textNodes = xmlDoc.getElementsByTagName("w:t");

  let docxText = `=== Document Word : ${file.name} ===\n`;
  for (let t of textNodes) {
    docxText += t.textContent + ' ';
  }
  return docxText + '\n\n';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

function updateWizardWordCount() {
  const content = document.getElementById('wizard-text-input')?.value || '';
  const count = content.trim() ? content.trim().split(/\s+/).length : 0;
  const countEl = document.getElementById('wizard-word-count');
  if (countEl) countEl.textContent = `${count} mot(s)`;
}

// WIZARD ÉTAPE 3 : CUSTOMISATION & APERÇU EN DIRECT
function selectDesign(designName) {
  state.wizard.design = designName;
  document.querySelectorAll('.design-card').forEach(c => {
    c.classList.remove('border-2', 'border-loulou-brown', 'scale-105');
    c.classList.add('border-stone-200');
  });
  const active = document.querySelector(`.design-card[data-design="${designName}"]`);
  if (active) {
    active.classList.add('border-2', 'border-loulou-brown', 'scale-105');
    active.classList.remove('border-stone-200');
  }
  updateLivePreview();
}

function selectPalette(paletteName) {
  state.wizard.palette = paletteName;
  document.querySelectorAll('.palette-card').forEach(c => {
    c.classList.remove('border-2', 'border-loulou-brown');
    c.classList.add('border-stone-200');
  });
  const active = document.querySelector(`.palette-card[data-palette="${paletteName}"]`);
  if (active) {
    active.classList.add('border-2', 'border-loulou-brown');
    active.classList.remove('border-stone-200');
  }
  document.documentElement.setAttribute('data-palette', paletteName);
  updateLivePreview();
}

function updateTitleFont(fontValue) {
  state.wizard.fontTitle = fontValue;
  document.documentElement.style.setProperty('--font-title', fontValue);
  updateLivePreview();
}

function updateBodyFont(fontValue) {
  state.wizard.fontBody = fontValue;
  document.documentElement.style.setProperty('--font-body', fontValue);
  updateLivePreview();
}

function toggleGridLines(checked) {
  state.wizard.noGrid = checked;
  updateLivePreview();
}

function updateLivePreview() {
  const preview = document.getElementById('live-a4-preview');
  if (!preview) return;

  // Réinitialiser les classes de papier
  preview.className = 'w-full max-w-[340px] sm:max-w-[380px] aspect-[1/1.414] rounded-2xl shadow-xl border border-stone-200 p-5 flex flex-col justify-between overflow-hidden transition-all duration-200';
  preview.classList.add(`paper-${state.wizard.design}`);

  if (state.wizard.noGrid) {
    preview.classList.add('no-grid');
  }

  const titleEl = document.getElementById('preview-sheet-title');
  if (titleEl) {
    titleEl.style.fontFamily = state.wizard.fontTitle;
    titleEl.textContent = (document.getElementById('wizard-course-title')?.value || 'LE CŒUR, DOUBLE POMPE').toUpperCase();
  }
}

// 4. MOTEUR DE GÉNÉRATION (PROMPT STYLE LOULOU)
async function launchGeneration() {
  const modal = document.getElementById('generation-modal');
  modal.classList.remove('hidden');

  // Animation checklist Loulou
  await animateChecklist();

  const title = document.getElementById('wizard-course-title')?.value.trim() || 'Nouveau cours';
  const rawText = document.getElementById('wizard-text-input')?.value.trim();
  const scope = document.getElementById('wizard-scope-input')?.value.trim() || 'Chapitre entier';

  let generatedCourse = null;

  try {
    if (state.settings.engine === 'gemini' && state.settings.geminiKey) {
      generatedCourse = await generateWithGemini(title, rawText, scope);
    } else if (state.settings.engine === 'ollama') {
      generatedCourse = await generateWithOllama(title, rawText, scope);
    } else {
      generatedCourse = generateHeuristicCourse(title, rawText, scope);
    }
  } catch (err) {
    console.warn('Erreur appel IA, bascule sur le moteur local heuristique:', err);
    generatedCourse = generateHeuristicCourse(title, rawText, scope);
  }

  // Appliquer les styles choisis
  generatedCourse.design = state.wizard.design;
  generatedCourse.palette = state.wizard.palette;
  generatedCourse.fontTitle = state.wizard.fontTitle;
  generatedCourse.fontBody = state.wizard.fontBody;
  generatedCourse.noGrid = state.wizard.noGrid;
  generatedCourse.color = state.wizard.color;
  generatedCourse.icon = state.wizard.icon;

  // Sauvegarder
  state.courses.unshift(generatedCourse);
  state.currentCourseId = generatedCourse.id;
  saveCourses();

  modal.classList.add('hidden');
  showFinalSheet(generatedCourse.id);
}

async function animateChecklist() {
  const steps = ['check-step-1', 'check-step-2', 'check-step-3', 'check-step-4'];
  for (let i = 0; i < steps.length; i++) {
    const el = document.getElementById(steps[i]);
    if (el) {
      el.className = 'flex items-center gap-2 text-stone-900 font-bold';
      el.querySelector('.step-icon').innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>';
      lucide.createIcons();
    }
    await new Promise(r => setTimeout(r, 450));
  }
}

// APPEL GEMINI API NATIVE
async function generateWithGemini(title, rawText, scope) {
  const apiKey = state.settings.geminiKey;
  const prompt = buildLoulouPrompt(title, rawText, scope);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const parts = [{ text: prompt }];

  // Si des images ont été uploadées, les intégrer directement en multimodal
  if (state.wizard.imageFiles.length > 0) {
    state.wizard.imageFiles.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.type || 'image/png',
          data: img.base64
        }
      });
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textOutput = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(textOutput);
  return formatAiOutput(parsed, title, rawText);
}

// APPEL OLLAMA LOCAL
async function generateWithOllama(title, rawText, scope) {
  const prompt = buildLoulouPrompt(title, rawText, scope) + "\n\nRenvoie UNIQUEMENT un objet JSON valide.";
  const model = state.settings.ollamaModel || 'llama3';

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      format: 'json',
      stream: false
    })
  });

  if (!response.ok) throw new Error('Ollama error');
  const data = await response.json();
  const parsed = JSON.parse(data.response);
  return formatAiOutput(parsed, title, rawText);
}

// PROMPT PÉDAGOGIQUE LOULOU STUDENT
function buildLoulouPrompt(title, rawText, scope) {
  return `Tu es Loulou, le tuteur d'élite qui crée des fiches de révision universitaires et lycéennes ultra-synthétiques, structurées et sans bavardage.
Périmètre ciblé : "${scope}".
Titre du cours : "${title}".
Contenu du cours :
"""
${rawText.substring(0, 15000)}
"""

Consignes strictes :
1. Chaque affirmation et question doit être strictement basée sur le cours fourni. Ne rien inventer.
2. Structure la fiche en 3 pages distinctes selon la maquette Loulou Student.
3. Inclus :
   - Des définitions essentielles ("term" et "definition").
   - Des formules ou mécanismes fondamentaux ("title", "formula", "description").
   - 2 à 3 sections numérotées majeures ("number", "title", "text").
   - Un tableau synthétique de comparaison ("title", "headers": ["A","B"], "rows": [["x","y"]]).
   - Des pièges fréquents à l'examen ("pitfalls").
   - 5 questions de QCM avec 4 choix (1 bonne, 3 distracteurs), la citation textuelle exacte du cours et l'explication.
   - 6 Flashcards (front, back).

Renvoie la réponse au format JSON suivant :
{
  "subtitle": "Sous-titre synthétique",
  "introduction": "Phrase d'accroche résumant l'enjeu du cours",
  "sections": [
    { "number": 1, "title": "TITRE SECTION", "content": "Résumé limpide" }
  ],
  "definitions": [
    { "term": "Terme clé", "definition": "Définition concise" }
  ],
  "formulas": [
    { "title": "Nom de la règle", "formula": "A = B + C", "description": "Explication" }
  ],
  "table": {
    "title": "Comparaison clé",
    "headers": ["Critère 1", "Critère 2"],
    "rows": [["Donnée A", "Donnée B"]]
  },
  "pitfalls": ["Attention : ne pas confondre X et Y"],
  "quotes": ["Citation exacte du texte"],
  "examQuestions": [
    {
      "question": "Énoncé ?",
      "options": ["Bonne réponse", "Faux 1", "Faux 2", "Faux 3"],
      "correctIndex": 0,
      "sourceQuote": "Extrait exact du cours d'où vient la réponse",
      "explanation": "Pourquoi c'est la bonne réponse"
    }
  ],
  "flashcards": [
    { "front": "Question / Notion", "back": "Réponse" }
  ]
}`;
}

function formatAiOutput(parsed, title, rawText) {
  return {
    id: 'course_' + Date.now(),
    title: title,
    date: new Date().toLocaleDateString('fr-FR'),
    rawContent: rawText,
    subtitle: parsed.subtitle || 'Synthèse complète',
    introduction: parsed.introduction || 'Notions clés du chapitre.',
    sheet: {
      sections: parsed.sections || [],
      definitions: parsed.definitions || [],
      formulas: parsed.formulas || [],
      table: parsed.table || null,
      pitfalls: parsed.pitfalls || [],
      quotes: parsed.quotes || []
    },
    exam: {
      questions: parsed.examQuestions || []
    },
    flashcards: parsed.flashcards || []
  };
}

// MOTEUR HEURISTIQUE LOCAL (100% Hors-ligne / Fallback)
function generateHeuristicCourse(title, rawText, scope) {
  const lines = (rawText || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const defs = [];

  lines.forEach(l => {
    if (l.includes(':') && l.length < 200) {
      const parts = l.split(':');
      if (parts[0].length < 40 && parts[1].length > 8) {
        defs.push({ term: parts[0].trim(), definition: parts[1].trim() });
      }
    }
  });

  if (defs.length === 0) {
    defs.push(
      { term: 'Notion Fondamentale', definition: 'Principe directeur étudié au sein de ce chapitre.' },
      { term: 'Mécanisme régulateur', definition: 'Action coordonnée assurant le bon déroulement du processus.' }
    );
  }

  return {
    id: 'course_' + Date.now(),
    title: title,
    date: new Date().toLocaleDateString('fr-FR'),
    rawContent: rawText,
    subtitle: scope,
    introduction: 'Ce document synthétise les lois, définitions et observations cliniques fondamentales du chapitre.',
    sheet: {
      sections: [
        { number: 1, title: 'ORGANISATION ET STRUCTURE GLOBALE', content: lines[0] || 'Structure fonctionnelle organisée en sous-unités spécialisées.' },
        { number: 2, title: 'MÉCANISMES ET CIRCULATION', content: lines[1] || 'Processus continu assurant l\'acheminement et les échanges physiologiques.' }
      ],
      definitions: defs,
      formulas: [
        { title: 'Débit / Équilibre', formula: 'Q = V × S  (Débit = Vitesse × Surface)', description: 'Règle de continuité régissant l\'écoulement laminaire.' }
      ],
      table: {
        title: 'Tableau comparatif des cavités et circuits',
        headers: ['Compartiment', 'Type de sang', 'Destination'],
        rows: [
          ['Cœur droit', 'Pauvre en O₂', 'Artère pulmonaire (Poumons)'],
          ['Cœur gauche', 'Riche en O₂', 'Aorte (Tout l\'organisme)']
        ]
      },
      pitfalls: [
        'Ne pas confondre les oreillettes (en haut, réception) et les ventricules (en bas, éjection).',
        'Vérifier que les conditions physiologiques normales s\'appliquent avant d\'extrapoler.'
      ],
      quotes: [
        'Deux pompes accolées : la droite irrigue les poumons, la gauche tout le corps.'
      ]
    },
    exam: {
      questions: [
        {
          question: `D'après le cours, quel compartiment propulse le sang vers les poumons ?`,
          options: ['Le ventricule droit', 'Le ventricule gauche', 'L\'oreillette gauche', 'L\'aorte'],
          correctIndex: 0,
          sourceQuote: 'Le cœur droit irrigue les poumons par l\'artère pulmonaire.',
          explanation: 'Le sang pauvre en O₂ est envoyé par le ventricule droit vers les poumons pour être oxygéné.'
        },
        {
          question: `Quel est le piège anatomique classique à éviter ?`,
          options: [
            'Confondre oreillettes et ventricules',
            'Inverser les hémi-circulations pulmonaire et systémique',
            'Négliger le rôle de la cloison étanche',
            'Toutes les réponses ci-dessus'
          ],
          correctIndex: 3,
          sourceQuote: 'Une cloison étanche, le septum, sépare les deux moitiés.',
          explanation: 'La rigueur terminologique est indispensable pour réussir l\'évaluation.'
        }
      ]
    },
    flashcards: [
      { front: 'Quel est le rôle du cœur droit ?', back: 'Recevoir le sang veineux pauvre en O₂ et l\'envoyer aux poumons.' },
      { front: 'Quel est le rôle du cœur gauche ?', back: 'Recevoir le sang oxygéné des poumons et l\'éjecter dans tout le corps.' }
    ]
  };
}

// 5. RENDU DE LA FICHE DÉTAILLÉE A4 (Captures 182305 & 182419)
function showFinalSheet(courseId) {
  hideAllViews();
  const el = document.getElementById('view-final-sheet');
  if (el) el.classList.remove('hidden');

  const id = courseId || state.currentCourseId;
  const course = state.courses.find(c => c.id === id);
  if (!course) return;
  state.currentCourseId = id;

  document.getElementById('final-course-badge').textContent = course.title;

  const container = document.getElementById('final-pages-container');
  container.innerHTML = '';

  // Appliquer le design et la palette
  const designClass = `paper-${course.design || 'quadrille'}`;
  const noGridClass = course.noGrid ? 'no-grid' : '';

  // PAGE 1 : Titre, Surligneur, Intro, Section 1 et Schéma
  const page1 = document.createElement('div');
  page1.className = `sheet-page-a4 w-full max-w-[780px] min-h-[1050px] bg-white rounded-3xl shadow-xl border border-stone-200 p-10 sm:p-14 flex flex-col justify-between space-y-6 ${designClass} ${noGridClass}`;
  
  page1.innerHTML = `
    <div class="space-y-6">
      <!-- En-tête -->
      <div class="border-b border-stone-200/80 pb-4">
        <div class="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
          <span>${course.subtitle || 'Fiche de révision'}</span>
          <span>${course.date}</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 highlight-marker" style="font-family: ${course.fontTitle || "'Amatic SC', cursive"}">
          ${escapeHtml(course.title.toUpperCase())}
        </h1>
        <p class="text-xs text-stone-500 font-medium mt-2">${escapeHtml(course.introduction || '')}</p>
      </div>

      <!-- Section ① Surlignée -->
      <div class="space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <span>①</span> ${escapeHtml(course.sheet.sections[0]?.title || 'STRUCTURE FONDAMENTALE')}
        </div>
        <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-body" style="font-family: ${course.fontBody || "'Quicksand', sans-serif"}">
          ${escapeHtml(course.sheet.sections[0]?.content || '')}
        </p>

        <!-- Cartouche Définition Visuel -->
        <div class="p-4 rounded-2xl border space-y-2 transition-colors" style="background-color: var(--theme-box-bg); border-color: var(--theme-box-border); color: var(--theme-box-text)">
          <span class="text-xs font-bold uppercase tracking-wider block">📌 Définitions clés à maîtriser :</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${course.sheet.definitions.slice(0, 4).map(d => `
              <div class="bg-white/80 p-2.5 rounded-xl border border-stone-100">
                <span class="font-bold text-xs text-stone-900 block">${escapeHtml(d.term)}</span>
                <span class="text-[11px] text-stone-600">${escapeHtml(d.definition)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Schéma / Diagramme Visuel -->
        <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 text-center space-y-2">
          <span class="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">Schéma fonctionnel</span>
          <div class="max-w-xs mx-auto py-2">
            <svg viewBox="0 0 200 110" class="w-full">
              <rect x="20" y="20" width="70" height="40" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
              <text x="55" y="44" font-size="9" text-anchor="middle" font-weight="bold" fill="#1e40af">Oreillettes</text>
              <line x1="90" y1="40" x2="110" y2="40" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
              <rect x="110" y="20" width="70" height="40" rx="8" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
              <text x="145" y="44" font-size="9" text-anchor="middle" font-weight="bold" fill="#991b1b">Ventricules</text>
              <text x="100" y="85" font-size="8" text-anchor="middle" fill="#64748b" font-style="italic">Éjection coordonnée vers les artères</text>
            </svg>
          </div>
        </div>

        <!-- Piège fréquent -->
        <div class="p-3.5 rounded-2xl border text-xs" style="background-color: var(--theme-warn-bg); border-color: var(--theme-warn-border); color: var(--theme-warn-text)">
          ⚠️ <strong>Piège d'examen :</strong> ${escapeHtml(course.sheet.pitfalls[0] || 'Attention aux confusions de termes fréquents.')}
        </div>
      </div>
    </div>

    <!-- Footer A4 -->
    <div class="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
      <span>${escapeHtml(course.title)}</span>
      <span>Page 1/2 · Fiche Loulou Local</span>
    </div>
  `;
  container.appendChild(page1);

  // PAGE 2 : Tableau Comparatif, Formules & Citations
  const page2 = document.createElement('div');
  page2.className = `sheet-page-a4 w-full max-w-[780px] min-h-[1050px] bg-white rounded-3xl shadow-xl border border-stone-200 p-10 sm:p-14 flex flex-col justify-between space-y-6 ${designClass} ${noGridClass}`;

  const tableHtml = course.sheet.table ? `
    <div class="space-y-2">
      <span class="text-xs font-bold text-stone-800 block">${escapeHtml(course.sheet.table.title)}</span>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left text-xs">
          <thead class="bg-amber-100 text-stone-900 font-bold">
            <tr>
              ${course.sheet.table.headers.map(h => `<th class="p-2.5 border-b border-stone-200">${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100 bg-white">
            ${course.sheet.table.rows.map(row => `
              <tr>${row.map(cell => `<td class="p-2.5 text-stone-700">${escapeHtml(cell)}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  page2.innerHTML = `
    <div class="space-y-6">
      <!-- Section ② Surlignée -->
      <div class="space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <span>②</span> ${escapeHtml(course.sheet.sections[1]?.title || 'LOIS ET COMPARATIF')}
        </div>
        <p class="text-xs sm:text-sm text-stone-700 leading-relaxed font-body" style="font-family: ${course.fontBody || "'Quicksand', sans-serif"}">
          ${escapeHtml(course.sheet.sections[1]?.content || '')}
        </p>

        <!-- Tableau comparatif -->
        ${tableHtml}

        <!-- Formules et Mécanismes -->
        ${course.sheet.formulas.length > 0 ? `
          <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider block">📐 Formules & Règles scientifiques :</span>
            ${course.sheet.formulas.map(f => `
              <div class="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span class="font-bold text-xs text-stone-900 block">${escapeHtml(f.title)}</span>
                <p class="font-mono text-xs text-emerald-700 py-1 font-bold">${escapeHtml(f.formula)}</p>
                <span class="text-[11px] text-stone-500">${escapeHtml(f.description)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Citations exactes du cours -->
        <div class="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-950 space-y-1.5">
          <span class="text-xs font-bold uppercase tracking-wider block">📖 Passages textuels clés du cours :</span>
          ${course.sheet.quotes.map(q => `
            <blockquote class="italic text-xs text-stone-700 border-l-2 border-purple-400 pl-3">
              « ${escapeHtml(q)} »
            </blockquote>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Footer A4 -->
    <div class="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
      <span>${escapeHtml(course.title)}</span>
      <span>Page 2/2 · Fiche Loulou Local</span>
    </div>
  `;
  container.appendChild(page2);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

// 6. DASHBOARD
function renderDashboard() {
  const grid = document.getElementById('dashboard-courses-grid');
  const empty = document.getElementById('dashboard-empty-state');
  const countBadge = document.getElementById('dashboard-course-count');
  if (!grid) return;
  grid.innerHTML = '';

  if (countBadge) countBadge.textContent = `${state.courses.length} fiche(s)`;

  if (state.courses.length === 0) {
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  state.courses.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl border border-stone-200 p-6 flex flex-col justify-between hover:border-stone-400 hover:shadow-md transition group';
    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-800 shadow-xs" style="background-color: ${c.color || '#fef3c7'}">
            <i data-lucide="${c.icon || 'book'}" class="w-4 h-4"></i>
          </div>
          <span class="text-xs text-stone-400 font-semibold">${c.date}</span>
        </div>
        <h3 class="text-base font-bold text-stone-900 group-hover:text-amber-700 transition line-clamp-2">
          ${escapeHtml(c.title)}
        </h3>
        <p class="text-xs text-stone-500 line-clamp-2">
          ${escapeHtml(c.subtitle || 'Fiche complète prête pour la révision.')}
        </p>
        <div class="flex items-center gap-3 pt-2 text-[11px] text-stone-400 font-medium">
          <span>📚 ${c.sheet?.definitions?.length || 0} déf.</span>
          <span>✍️ ${c.exam?.questions?.length || 0} QCM</span>
          <span>🎴 ${c.flashcards?.length || 0} cartes</span>
        </div>
      </div>

      <div class="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
        <button onclick="showFinalSheet('${c.id}')" class="flex-1 py-2 px-3 rounded-xl bg-loulou-brown hover:bg-loulou-brownHover text-white text-xs font-bold transition text-center">
          Voir la fiche
        </button>
        <button onclick="startExamForCourse('${c.id}')" class="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition" title="Examen Blanc">
          QCM
        </button>
        <button onclick="startFlashcardsForCourse('${c.id}')" class="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition" title="Flashcards">
          🎴
        </button>
        <button onclick="deleteCourse('${c.id}')" class="p-2 text-stone-400 hover:text-rose-600 transition" title="Supprimer">
          <i data-lucide="trash" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  lucide.createIcons();
}

function deleteCourse(id) {
  if (confirm("Supprimer cette fiche et son examen blanc ?")) {
    state.courses = state.courses.filter(c => c.id !== id);
    saveCourses();
    renderDashboard();
  }
}

// 7. EXAMEN BLANC / QCM
function startExamForCurrentSheet() {
  startExamForCourse(state.currentCourseId);
}

function openActiveExam() {
  if (state.courses.length > 0) {
    startExamForCourse(state.courses[0].id);
  } else {
    alert("Veuillez d'abord créer une fiche.");
  }
}

function startExamForCourse(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course || !course.exam?.questions || course.exam.questions.length === 0) {
    alert("Aucun examen blanc n'a été généré pour ce cours.");
    return;
  }

  state.activeExam = {
    courseId: courseId,
    courseTitle: course.title,
    questions: course.exam.questions,
    currentIndex: 0,
    answers: {}
  };

  hideAllViews();
  document.getElementById('view-exam').classList.remove('hidden');
  document.getElementById('exam-course-name').textContent = course.title;
  document.getElementById('exam-question-box').classList.remove('hidden');
  document.getElementById('exam-result-box').classList.add('hidden');

  renderExamQuestion();
  lucide.createIcons();
}

function renderExamQuestion() {
  const exam = state.activeExam;
  const q = exam.questions[exam.currentIndex];
  const total = exam.questions.length;

  document.getElementById('exam-q-number').textContent = `Question ${exam.currentIndex + 1} / ${total}`;
  document.getElementById('exam-progress-bar').style.width = `${((exam.currentIndex + 1) / total) * 100}%`;
  document.getElementById('exam-q-text').textContent = q.question;

  const container = document.getElementById('exam-options-list');
  container.innerHTML = '';

  const userAnswer = exam.answers[exam.currentIndex];
  const answered = userAnswer !== undefined;

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ';
    
    if (answered) {
      if (idx === q.correctIndex) {
        btn.className += 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
      } else if (idx === userAnswer) {
        btn.className += 'bg-rose-50 border-rose-500 text-rose-900';
      } else {
        btn.className += 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
      }
    } else {
      btn.className += 'bg-white border-stone-200 hover:border-loulou-brown text-stone-800';
      btn.onclick = () => {
        exam.answers[exam.currentIndex] = idx;
        renderExamQuestion();
      };
    }

    btn.innerHTML = `
      <span>${escapeHtml(opt)}</span>
      <span class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">${String.fromCharCode(65 + idx)}</span>
    `;
    container.appendChild(btn);
  });

  const quoteBox = document.getElementById('exam-quote-reveal');
  if (answered) {
    quoteBox.classList.remove('hidden');
    document.getElementById('exam-quote-text').textContent = `« ${q.sourceQuote || 'Citation du cours'} »`;
    document.getElementById('exam-quote-explanation').textContent = q.explanation || 'Explication pédagogique basée sur le cours.';
    document.getElementById('exam-btn-next').textContent = exam.currentIndex === total - 1 ? 'Voir le bilan' : 'Question suivante';
  } else {
    quoteBox.classList.add('hidden');
    document.getElementById('exam-btn-next').textContent = 'Valider';
  }

  document.getElementById('exam-btn-prev').disabled = exam.currentIndex === 0;
  lucide.createIcons();
}

function nextExamQuestion() {
  const exam = state.activeExam;
  if (exam.answers[exam.currentIndex] === undefined) {
    alert('Sélectionne une réponse avant de continuer.');
    return;
  }
  if (exam.currentIndex < exam.questions.length - 1) {
    exam.currentIndex++;
    renderExamQuestion();
  } else {
    showExamResult();
  }
}

function prevExamQuestion() {
  if (state.activeExam && state.activeExam.currentIndex > 0) {
    state.activeExam.currentIndex--;
    renderExamQuestion();
  }
}

function showExamResult() {
  const exam = state.activeExam;
  let correct = 0;
  exam.questions.forEach((q, i) => {
    if (exam.answers[i] === q.correctIndex) correct++;
  });

  const note = Math.round((correct / exam.questions.length) * 20 * 10) / 10;
  document.getElementById('exam-question-box').classList.add('hidden');
  document.getElementById('exam-result-box').classList.remove('hidden');
  document.getElementById('exam-final-score').textContent = `${note} / 20`;
  
  const appraisal = document.getElementById('exam-final-appraisal');
  if (note >= 16) appraisal.textContent = '🌟 Remarquable ! Notions maîtrisées avec précision.';
  else if (note >= 10) appraisal.textContent = '👍 Validé ! Revois les pièges pour sécuriser ta note.';
  else appraisal.textContent = '⚠️ À retravailler. Relis la fiche de révision et retente le test.';
}

// 8. FLASHCARDS
function startFlashcardsForCurrentSheet() {
  startFlashcardsForCourse(state.currentCourseId);
}

function openActiveFlashcards() {
  if (state.courses.length > 0) {
    startFlashcardsForCourse(state.courses[0].id);
  } else {
    alert("Veuillez d'abord créer une fiche.");
  }
}

function startFlashcardsForCourse(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course || !course.flashcards || course.flashcards.length === 0) {
    alert("Aucune flashcard disponible pour ce cours.");
    return;
  }

  state.activeFlashcards = {
    cards: course.flashcards,
    currentIndex: 0,
    isFlipped: false
  };

  hideAllViews();
  document.getElementById('view-flashcards').classList.remove('hidden');
  document.getElementById('flashcards-course-name').textContent = course.title;
  renderFlashcard();
}

function renderFlashcard() {
  const deck = state.activeFlashcards;
  const card = deck.cards[deck.currentIndex];
  document.getElementById('flashcard-counter').textContent = `${deck.currentIndex + 1} / ${deck.cards.length}`;
  document.getElementById('flashcard-front-text').textContent = card.front;
  document.getElementById('flashcard-back-text').textContent = card.back;

  const inner = document.getElementById('flashcard-3d-inner');
  if (inner) {
    inner.classList.remove('is-flipped');
    deck.isFlipped = false;
  }
  lucide.createIcons();
}

function flipFlashcard() {
  const inner = document.getElementById('flashcard-3d-inner');
  if (inner) {
    inner.classList.toggle('is-flipped');
    state.activeFlashcards.isFlipped = inner.classList.contains('is-flipped');
  }
}

function rateFlashcard(rating) {
  const deck = state.activeFlashcards;
  if (deck.currentIndex < deck.cards.length - 1) {
    deck.currentIndex++;
    renderFlashcard();
  } else {
    alert('🎉 Bravo ! Tu as révisé toutes les cartes de ce paquet !');
    showFinalSheet();
  }
}

// Raccourcis clavier Flashcards
document.addEventListener('keydown', (e) => {
  const view = document.getElementById('view-flashcards');
  if (view && !view.classList.contains('hidden')) {
    if (e.code === 'Space') {
      e.preventDefault();
      flipFlashcard();
    } else if (e.code === 'ArrowRight') {
      rateFlashcard('good');
    } else if (e.code === 'ArrowLeft' && state.activeFlashcards.currentIndex > 0) {
      state.activeFlashcards.currentIndex--;
      renderFlashcard();
    }
  }
});

// 9. DÉTECTION AUTOMATIQUE D'OLLAMA SUR LE PC
async function detectOllamaModels(showNotification = true) {
  const statusEl = document.getElementById('ollama-detect-status');
  const selectEl = document.getElementById('select-ollama-models');
  if (statusEl) statusEl.textContent = 'Scan en cours sur http://localhost:11434...';

  try {
    const res = await fetch('http://localhost:11434/api/tags');
    if (!res.ok) throw new Error('Ollama inaccessible');
    const data = await res.json();

    if (data.models && data.models.length > 0) {
      selectEl.innerHTML = '';
      data.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        selectEl.appendChild(opt);
      });
      if (statusEl) statusEl.innerHTML = `✅ <strong>${data.models.length} modèle(s) détecté(s)</strong> sur ton PC !`;
      if (showNotification) alert(`Ollama actif ! ${data.models.length} modèles trouvés.`);
    } else {
      if (statusEl) statusEl.textContent = 'Ollama tourne mais aucun modèle n\'est téléchargé (lance `ollama pull llama3`).';
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `⚠️ <em>Ollama non détecté sur le port 11434.</em> (Assure-toi que l'application Ollama est bien lancée sur ton PC).`;
    }
    if (showNotification) {
      alert("Ollama n'a pas répondu sur localhost:11434. Lancez Ollama dans votre terminal ou passez par Gemini API.");
    }
  }
}

function toggleAiInputs(engineName) {
  state.settings.engine = engineName;
  updateActiveModelBadge();
}

function openSettingsModal() {
  document.getElementById('settings-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

// 10. COURS D'EXEMPLE OFFICIEL DE LOULOU (Le Cœur, double pompe)
function loadSampleHeartCourse(navigateAfter = true) {
  const sampleCourse = {
    id: 'course_loulou_heart_sample',
    title: 'Le Cœur, double pompe',
    date: new Date().toLocaleDateString('fr-FR'),
    subtitle: 'SVT · Physiologie humaine · Seconde',
    color: '#f3d2c9',
    icon: 'heart',
    design: 'quadrille',
    palette: 'fluo-jaune-bleu',
    fontTitle: "'Amatic SC', cursive",
    fontBody: "'Quicksand', sans-serif",
    noGrid: false,
    rawContent: `Deux pompes accolées : la droite irrigue les poumons, la gauche tout le corps. Elles battent ensemble environ 100 000 fois par jour.
Quatre cavités, deux circuits.
Le cœur droit propulse le sang pauvre en O₂ vers les poumons par l'artère pulmonaire.
Le cœur gauche propulse le sang riche en O₂ vers tout le corps par l'aorte.
Chaque moitié compte une oreillette en haut, qui reçoit le sang, et un ventricule en bas, qui l'éjecte.
Une cloison étanche, le septum, sépare les deux moitiés : le sang de droite ne se mélange jamais avec celui de gauche.`,
    introduction: 'Deux pompes accolées : la droite irrigue les poumons, la gauche tout le corps. Elles battent ensemble environ 100 000 fois par jour.',
    sheet: {
      sections: [
        {
          number: 1,
          title: 'QUATRE CAVITÉS, DEUX CIRCUITS',
          content: 'Le cœur est un muscle creux cloisonné en deux parties indépendantes. Chaque moitié comprend une oreillette réceptrice à paroi fine et un ventricule éjecteur à paroi musculaire épaisse.'
        },
        {
          number: 2,
          title: 'HÉMI-CIRCULATIONS PULMONAIRE ET SYSTÉMIQUE',
          content: 'La circulation pulmonaire (petite circulation) réoxygène le sang et élimine le dioxyde de carbone. La circulation générale (grande circulation) distribue les nutriments et l\'oxygène à tous les organes.'
        }
      ],
      definitions: [
        { term: 'Cœur droit', definition: 'Reçoit le sang désoxygéné des veines caves et le propulse vers l\'artère pulmonaire.' },
        { term: 'Cœur gauche', definition: 'Reçoit le sang oxygéné des veines pulmonaires et l\'éjecte dans l\'aorte.' },
        { term: 'Septum cardiaque', definition: 'Cloison musculaire étanche séparant rigoureusement les cavités droites et gauches.' },
        { term: 'Valves cardiaques', definition: 'Structures assurant le sens unique de la circulation sanguine (empêchent le reflux).' }
      ],
      formulas: [
        {
          title: 'Débit Cardiaque (Dc)',
          formula: 'Dc = Fc × Ves  (~ 5 L/min au repos)',
          description: 'Débit cardiaque = Fréquence cardiaque (battements/min) × Volume d\'éjection systolique (L).'
        }
      ],
      table: {
        title: 'Tableau comparatif des circuits sanguins',
        headers: ['Circuit', 'Cavité de départ', 'Vaisseau de départ', 'Rôle physiologique'],
        rows: [
          ['Petite circulation', 'Ventricule droit', 'Artère pulmonaire', 'Hématose (oxygénation aux poumons)'],
          ['Grande circulation', 'Ventricule gauche', 'Aorte', 'Distribution tissulaire d\'O₂ et nutriments']
        ]
      },
      pitfalls: [
        'Le sang riche en O₂ et le sang pauvre en O₂ ne se mélangent JAMAIS chez l\'adulte.',
        'Les artères partent du cœur (qu\'elles soient riches ou pauvres en O₂), les veines y arrivent.'
      ],
      quotes: [
        'Une cloison étanche, le septum, sépare les deux moitiés : le sang de droite ne se mélange jamais avec celui de gauche.'
      ]
    },
    exam: {
      questions: [
        {
          question: 'Quel vaisseau transporte le sang désoxygéné depuis le cœur droit vers les poumons ?',
          options: ['L\'artère pulmonaire', 'L\'aorte', 'La veine cave supérieure', 'Les veines pulmonaires'],
          correctIndex: 0,
          sourceQuote: 'Le cœur droit propulse le sang pauvre en O₂ vers les poumons par l\'artère pulmonaire.',
          explanation: 'Toutes les artères partent du cœur. L\'artère pulmonaire est l\'unique artère conduisant un sang pauvre en O₂.'
        },
        {
          question: 'Quelle structure empêche tout mélange de sang entre le cœur droit et le cœur gauche ?',
          options: ['Le septum cardiaque', 'La valve mitrale', 'Le péricarde', 'L\'artère coronaire'],
          correctIndex: 0,
          sourceQuote: 'Une cloison étanche, le septum, sépare les deux moitiés.',
          explanation: 'Le septum interventriculaire et interauriculaire constitue la barrière étanche fondamentale.'
        },
        {
          question: 'Combien de fois par jour le cœur bat-il en moyenne selon le cours ?',
          options: ['Environ 100 000 fois', 'Environ 10 000 fois', 'Environ 500 000 fois', 'Environ 1 000 000 de fois'],
          correctIndex: 0,
          sourceQuote: 'Elles battent ensemble environ 100 000 fois par jour.',
          explanation: 'Donnée chiffrée exacte extraite du document de cours.'
        }
      ]
    },
    flashcards: [
      { front: 'Quel est le rôle du septum cardiaque ?', back: 'Cloison étanche empêchant tout mélange entre sang désoxygéné et sang oxygéné.' },
      { front: 'Quelle cavité propulse le sang dans l\'aorte ?', back: 'Le ventricule gauche (paroi musculaire la plus épaisse).' },
      { front: 'Quelle est la formule du débit cardiaque ?', back: 'Dc = Fc (Fréquence cardiaque) × Ves (Volume d\'éjection systolique).' }
    ]
  };

  const existingIdx = state.courses.findIndex(c => c.id === sampleCourse.id);
  if (existingIdx >= 0) {
    state.courses[existingIdx] = sampleCourse;
  } else {
    state.courses.unshift(sampleCourse);
  }

  state.currentCourseId = sampleCourse.id;
  saveCourses();

  // Si on est dans le wizard, pré-remplir les champs
  const titleInput = document.getElementById('wizard-course-title');
  if (titleInput) titleInput.value = sampleCourse.title;

  const textInput = document.getElementById('wizard-text-input');
  if (textInput) textInput.value = sampleCourse.rawContent;
  updateWizardWordCount();

  if (navigateAfter) {
    goToWizardStep(3);
  }
}

// UTILITAIRES
function escapeHtml(text) {
  if (!text) return '';
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
