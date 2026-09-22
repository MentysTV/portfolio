# 🎮 Návod k použití: MentysTV Cyber Violet Stream Suite v OBS Studio

Tento balíček je navržený tak, aby tvůj stream vypadal jako špičková esports produkce. Všechny scény i prvky jsou postavené na moderním **HTML5 + CSS3 + Canvas**, což znamená **minimální zátěž na procesor a grafickou kartu** (na rozdíl od těžkých MP4 videí).

---

## 🚀 1. Rychlé spuštění a náhled

Poklepej na soubor **`SPUSTIT_STREAM_PACKAGE.bat`** v hlavní složce.
Otevře se ti **Stream Control Hub** v prohlížeči, kde můžeš:
- Prohlížet všechny scény a overlaye v reálném čase.
- Testovat alerty (Follower, Sub, Donate, Raid) jedním kliknutím.
- Zkopírovat si přesnou cestu pro každý prvek do OBS.
- Stáhnout si hotové emoty pro Twitch a Discord.

---

## 🖥 2. Jak vložit scény do OBS Studio

V OBS Studiu máš dvě možnosti: **Místní soubor (Local File)** nebo **Lokální URL**. Obě fungují perfektně.

### Krok za krokem:
1. V OBS v panelu **Scény** (Scenes) vytvoř novou scénu (např. `1. Stream Začíná`).
2. V panelu **Zdroje** (Sources) klikni na **`+`** a vyber **Prohlížeč** (*Browser*).
3. Pojmenuj zdroj (např. `Overlay - Starting Soon`).
4. V nastavení zaškrtni **Místní soubor** (*Local file*) a klikni na **Procházet** (*Browse*):
   - Vyber `stream_package/scenes/starting_soon.html`.
5. Nastav rozměry:
   - **Šířka (Width):** `1920`
   - **Výška (Height):** `1080`
   - **FPS:** `60`
6. Doporučujeme zaškrtnout:
   - ✅ **Vypnout zdroj, pokud není viditelný** (*Shutdown source when not visible*)
   - ✅ **Obnovit prohlížeč, když se scéna stane aktivní** (*Refresh browser when scene becomes active*)
7. Klikni na **OK**. Scéna je připravena!

---

## 🎬 3. Seznam připravených scén a jejich určení

| Scéna v OBS | Soubor k načtení | Popis |
| :--- | :--- | :--- |
| **Stream Začíná** | `scenes/starting_soon.html` | Úvodní scéna s animovaným logem MentysTV, 5min odpočtem a sociálními sítěmi. |
| **Hra / Gameplay** | `scenes/gameplay_overlay.html` | Průhledný herní HUD – obsahuje horní lištu (poslední follower/sub/donate), rámeček na webkameru vlevo dole a prostor pro chat vpravo. |
| **Just Chatting** | `scenes/just_chatting.html` | Scéna na povídání s diváky: velká webkamera vlevo, živý chat vpravo, běžící lišta novinek dole. |
| **Pauza / BRB** | `scenes/brb.html` | Scéna pro chvíle, kdy si odběhneš pro pití („Hned jsem zpět“ s pulzujícím neonovým jádrem). |
| **Konec Streamu** | `scenes/ending.html` | Závěrečná scéna s poděkováním („Díky za sledování!“) a zobrazením tvých emotů a odkazů. |

---

## 📷 4. Jak nastavit herní scénu s webkamerou

V herní scéně uspořádej zdroje v tomto pořadí (odshora dolů):

1. **`Overlay - Gameplay HUD`** *(Browser Source s `gameplay_overlay.html` – nahoře)*
2. **`Moje Webkamera`** *(Video Capture Device – umístěná přesně do levého dolního rohu pod neonový rámeček)*
3. **`Záznam hry`** *(Game Capture / Screen Capture – úplně vespod)*

> **Tip:** Pokud chceš rámeček na kameru umístit na jiné místo nebo ho použít samostatně, použij komponentu **`components/webcam_frame.html`**.

---

## ⚡ 5. Nastavení Stinger přechodu (Cut efekt mezi scénami)

1. V OBS v panelu **Přechody mezi scénami** (*Scene Transitions*) klikni na roletku a vyber **Přidat: Stinger**.
2. Jako zdroj vyber animovaný přechod `components/stinger_transition.html` (nebo vygenerované WebM/video).
3. **Typ bodu přechodu:** Čas (Time)
4. **Časový bod přechodu:** `500 ms` (přesně ve chvíli, kdy fialovo-cyanový blesk a logo zakryjí obrazovku).

---

## 🎨 6. Vlastní Twitch & Discord Emoty

Ve složce `stream_package/assets/emotes/` máš připravené 4 prémiové emoty ve všech standardních velikostech pro Twitch affiliate / partner i Discord:

1. **mentysHYPE** – neonový kyberpunkový gamer s VR brýlemi křičící nadšení.
2. **mentysGG** – zlatofialový 3D kybernetický odznak vítězství.
3. **mentysRAGE** – glitch flame rage emotikon při těsné prohře.
4. **mentysLURK** – tajemný kyber ninja v kapuci pro tiché lurkery.

Velikosti:
- `_112.png` (Twitch Large / Discord Sticker)
- `_56.png` (Twitch Medium)
- `_28.png` (Twitch Chat)
- Master PNG (Originální vysoké rozlišení)

Nahraj je přímo v **Twitch Creator Dashboard -> Zlepšení pro diváky -> Emotikony**.
