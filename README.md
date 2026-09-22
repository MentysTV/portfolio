# Cyber Violet Portfolio & Dev Hub – Lukáš Jiránek

Moderní, temně fialový kyber-neonový osobní web a portfolio pro prezentaci softwaru, aplikací, her, AI nástrojů a technických projektů.

---

## Rychlé spuštění (1 kliknutím)

- **Webové portfolio**: Dvojklikněte na [SPUSTIT_PORTFOLIO.bat](file:///c:/Users/MentysTV/Downloads/portfolio_cyber_violet/SPUSTIT_PORTFOLIO.bat) pro okamžité otevření v prohlížeči.
- **Cyber PC Monitor**: Dvojklikněte na [SPUSTIT_CYBER_PC_MONITOR.bat](file:///c:/Users/MentysTV/Downloads/portfolio_cyber_violet/SPUSTIT_CYBER_PC_MONITOR.bat) pro spuštění živého sledování výkonu PC.
- **Stažitelný balíček PC Monitoru**: Připraven v archivu [Cyber_PC_Monitor_v1.1.zip](file:///c:/Users/MentysTV/Downloads/portfolio_cyber_violet/Cyber_PC_Monitor_v1.1.zip) (obsahuje i `SPUSTIT_CYBER_PC_MONITOR.bat` pro čisté spuštění bez varování Windows SmartScreen a systém automatické kontroly aktualizací).

---

## Klíčové vlastnosti & Architektura

1. **Tmavě fialový & Cyber Neon design**:
   - Luxusní barevná paleta: hluboká temná fialová, elektrická tyrkysová (Neon Cyan), svítivá fialová (Neon Purple) a magenta.
   - Glassmorphism, zářící ambientní efekty, terminálový Cyber HUD a plynulé mikro-animace.
   - 100% čisté vektorové SVG ikony – bez rušivých emoji.

2. **Horní lišta kategorií s okamžitým skokem**:
   - Rychlé přepínače kategorií v horní liště (`Software`, `Web`, `Nástroje`, `Hry`, `AI`).
   - Po kliknutí tě stránka plynule přenese přímo na sekci projektů a automaticky vyfiltruje zvolenou kategorii se světelným pulzem.

3. **Živé vyhledávání & Filtrování projektů v reálném čase**:
   - Integrované vyhledávací pole pro okamžité filtrování projektů podle názvu, tagů nebo popisu.
   - Přehledné počítadlo zobrazených výsledků.

4. **Přihlášení & Uživatelský profil (Google / Gmail & Klasický účet)**:
   - Možnost přihlášení jedním klikem přes Google / Gmail účet (s animací ověření).
   - Klasická registrace jménem, emailem a heslem.
   - Stav přihlášení se ukládá do `localStorage` prohlížeče – po přihlášení se v hlavičce zobrazí tvůj avatar s online indikátorem a rozbalovacím menu.

5. **Snadné přidávání vlastních projektů**:
   - Tlačítko **"+ Přidat projekt"** přímo v sekci projektů i v profilovém menu.
   - Interaktivní formulář s výběrem systémové SVG ikony, kategorií, štítků, popisu a odkazů na GitHub a Live Demo.
   - Projekty se okamžitě zobrazí na webu a uloží do paměti prohlížeče.
   - Tlačítko **"Zkopírovat kód pro main.js"** umožní vygenerovat čistý JavaScript kód pro trvalé vložení do `js/main.js`.

---

## NÁVOD: Jak mít web dostupný nonstop 24/7 ZDARMA na GitHub Pages

Aby byl tvůj web dostupný komukoliv na internetu kdykoliv (24 hodin denně, 7 dní v týdnu), využijeme **GitHub Pages** – je to 100% zdarma a spolehlivé.

### Možnost A: Nejjednodušší způsob (přímo v prohlížeči, bez příkazů)

1. Jdi na [github.com/new](https://github.com/new) a přihlaš se (nebo si založ účet).
2. Zadej název repozitáře (např. `portfolio` nebo `web`).
3. Zvol **Public** (Veřejný) a klikni na **Create repository**.
4. Na zobrazené stránce klikni na odkaz **"uploading an existing file"**.
5. Označ a přetáhni sem ze složky tyto soubory:
   - `index.html`
   - celou složku `css` (obsahující `style.css`)
   - celou složku `js` (obsahující `main.js`)
   - `README.md`
6. Dole klikni na zelené tlačítko **Commit changes**.
7. Nahoře v menu repozitáře klikni na **Settings** (Ozubené kolečko).
8. V levém bočním sloupci zvol **Pages**.
9. V sekci **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: vyber `main` a složku `/ (root)`
   - Klikni na **Save**.
10. **Hotovo!** Během cca 1 minuty se nahoře objeví hláška s odkazem:
    ```
    https://<tvoje-jmeno>.github.io/<nazev-repozitare>/
    ```
    Na této adrese tvůj web poběží nonstop.

---

### Možnost B: Pomocí Gitu v terminálu

Otevři terminál (PowerShell) v této složce a zadej tyto příkazy:

```powershell
# 1. Inicializace gitu
git init

# 2. Přidání všech souborů
git add .

# 3. Vytvoření prvního commitu
git commit -m "Cyber Violet Portfolio & Dev Hub"

# 4. Přejmenování větve na main
git branch -M main

# 5. Propojení s tvým GitHub repozitářem (nahraď TVOJE_JMENO a NAZEV_REPO)
git remote add origin https://github.com/TVOJE_JMENO/NAZEV_REPO.git

# 6. Odeslání na GitHub
git push -u origin main
```

Následně v repozitáři na GitHubu zapni **Settings** -> **Pages** -> Branch: `main` / `root` -> **Save**.

---

## Lokální spuštění na počítači

- Stačí dvakrát kliknout na `index.html` v libovolném prohlížeči (Chrome, Brave, Firefox, Edge).
- Nebo spustit lokální server v terminálu:
  ```powershell
  python -m http.server 8080
  ```
  a v prohlížeči otevřít `http://localhost:8080`.
