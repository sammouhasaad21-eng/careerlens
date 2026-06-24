# CareerLens — Schritt-für-Schritt Anleitung (Deutsch)

## Was ist das hier?

Ein KI-gestützter Lebenslauf-Analysator für IT-Fachleute.
Benutzer fügen ihren CV und eine Stellenbeschreibung ein — das KI analysiert beides und gibt:
- Einen Match Score (0–100%)
- Fehlende Skills
- Verbesserungsvorschläge für den CV
- Interview-Fragen
- Einen Lernplan

---

## Was du brauchst (alles kostenlos)

1. **GitHub Account** — du hast bereits einen ✅
2. **Netlify Account** — kostenlos auf netlify.com
3. **Anthropic API Key** — kostenlos auf console.anthropic.com ($5 Startguthaben)

---

## Schritt 1 — Anthropic API Key holen (5 Minuten)

1. Gehe zu https://console.anthropic.com
2. Registriere dich
3. Klicke links auf **"API Keys"**
4. Klicke **"+ Create Key"**
5. Gib ihm einen Namen z.B. "careerlens"
6. Kopiere den Key (sieht aus wie: `sk-ant-api03-xxxx...`)
7. Bewahre ihn sicher auf — du siehst ihn nur einmal!

---

## Schritt 2 — Dateien auf GitHub hochladen (5 Minuten)

### Option A: Per Browser (einfacher, kein Git nötig)

1. Gehe zu https://github.com
2. Klicke auf **"New repository"** (grüner Button oben rechts)
3. Name: `careerlens`
4. Auf "Public" lassen
5. Klicke **"Create repository"**
6. Klicke auf **"uploading an existing file"** (Link in der Mitte)
7. Ziehe ALLE Dateien aus dem `careerlens-netlify` Ordner rein
   - Wichtig: Auch den Ordner `netlify/functions/` mit hochladen!
8. Klicke **"Commit changes"**

### Option B: Per Terminal (falls du Git kennst)

```bash
cd careerlens-netlify
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN_USERNAME/careerlens.git
git push -u origin main
```

---

## Schritt 3 — Netlify verbinden (5 Minuten)

1. Gehe zu https://netlify.com
2. Klicke **"Sign up"** → **"Sign up with GitHub"** (am einfachsten)
3. Auf dem Dashboard: Klicke **"Add new site"** → **"Import an existing project"**
4. Wähle **"GitHub"**
5. Wähle dein Repository `careerlens`
6. Build-Einstellungen:
   - Build command: **leer lassen**
   - Publish directory: **`.`** (nur ein Punkt)
7. Klicke **"Deploy site"**

Netlify deployt jetzt die Website. Du bekommst eine URL wie:
`https://amazing-name-123.netlify.app`

---

## Schritt 4 — API Key eintragen (2 Minuten)

Das ist der wichtigste Schritt!

1. In Netlify: Gehe zu **Site configuration** → **Environment variables**
2. Klicke **"Add a variable"**
3. Key: `ANTHROPIC_API_KEY`
4. Value: Dein API Key von Schritt 1 (`sk-ant-api03-...`)
5. Klicke **"Save"**
6. Gehe zu **Deploys** → Klicke **"Trigger deploy"** → **"Deploy site"**

✅ Fertig! Deine Website ist jetzt live und benutzt echte KI.

---

## Schritt 5 — Testen

1. Öffne deine Netlify URL
2. Scrolle runter zum Analyzer
3. Füge einen CV ein (oder klicke "Load example CV")
4. Füge eine Stellenbeschreibung ein
5. Klicke "Analyze my CV →"
6. Nach ~20 Sekunden siehst du die echte KI-Analyse

---

## Eigene Domain (optional, ~€10/Jahr)

1. Kaufe eine Domain bei Namecheap, Cloudflare Registrar, oder Porkbun
2. In Netlify: **Domain management** → **Add custom domain**
3. Folge den DNS-Anweisungen
4. SSL wird automatisch eingerichtet (kostenlos)

---

## Kosten

| Was | Wann | Wie viel |
|-----|------|----------|
| Netlify Hosting | Immer | Kostenlos (bis 100GB/Monat) |
| Netlify Functions | Bis 125.000 Aufrufe/Monat | Kostenlos |
| Claude API | Pro Analyse | ~$0.003–0.005 |
| Domain | Pro Jahr | ~€10 |

Bei 100 Analysen pro Tag: ~$0.40/Tag API-Kosten.

---

## Häufige Probleme

**"Function not found" Fehler:**
→ Prüfe ob der Ordner `netlify/functions/` auf GitHub hochgeladen wurde

**"API key invalid" Fehler:**
→ Prüfe die Environment Variable in Netlify — kein Leerzeichen vor/nach dem Key

**Analyse lädt ewig:**
→ Netlify Functions haben ein 10-Sekunden Timeout im Free Plan
→ Lösung: Wechsle auf "Netlify Pro" ($19/Monat) oder nutze Cloudflare Workers (hat 30s Timeout)

**Website zeigt "Mock" Daten:**
→ In script.js muss `MOCK_MODE: false` stehen — prüfen ob richtig hochgeladen

---

## Nächste Schritte nach dem Launch

1. **Woche 1:** Zeige es 5 Freunden. Frage nach ehrlichem Feedback.
2. **Woche 2:** Post auf Reddit r/cscareerquestions mit Screenshot
3. **Woche 3:** Füge Stripe Zahlung hinzu (€9/Monat Pro Plan)
4. **Monat 2:** Eigene Domain, SEO optimieren

---

## Fragen?

Wenn etwas nicht funktioniert, schreibe mir genau:
- Was du gemacht hast
- Was der Fehler war (Screenshot oder Text)
- Auf welchem Schritt du steckst

Dann helfe ich dir direkt weiter.
