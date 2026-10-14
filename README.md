# RealmQuest V5 — Character Creator

## V5 polish update
- New three-step flow: Intro page → Character Creation → Game screen.
- The game is no longer displayed on the same page as the character creator. Use “Character / Account” in the game to return to setup.
- Guest players can save a character locally and enter the game without configuring online accounts.
- Login and account creation show a clear setup message until Firebase is configured. Real online login cannot be activated with placeholder Firebase values.

## What's new
- Avatar appearance studio: avatar emoji, aura colour, hairstyle, face, outfit and weapon style.
- Playable races: Human, Elf, Demon, Dragonkin and Dwarf, each with attribute bonuses.
- Strength, Intelligence, Agility, Vitality and Luck attributes, plus spendable points.
- Mana-based Arcane Burst, login/auth scaffold and existing adventure features.

## Publish the update
Upload every file in this `realmquest` folder to the root of your existing GitHub repository, replacing files with the same names. Add the new `character.js` and `flow.js` files too. Wait for Render to redeploy.

## Notes
Character appearance/race/attributes currently save in this browser using localStorage. Online authentication needs the Firebase configuration described in `auth.js`; these character attributes are not yet synchronised to a cloud database or other devices. Attribute totals show race bonuses; this prototype does not yet apply every attribute to battle calculations.


## Mana rules
Mage, Summoner, and Necromancer start with 100/100 MP. Swordsman and Assassin start with 50/50 MP. Choosing a mana-focused class restores MP to 100. Resting at camp restores both HP and MP.

## Enable real email/password login
1. Create your own Firebase project and register a Web app.
2. In Firebase Authentication, enable the Email/Password provider.
3. Copy the web app configuration into `auth.js`, replacing each `PASTE_YOUR_...` placeholder.
4. Add your deployed Render site domain to Firebase Authentication authorized domains if Firebase asks for it.
5. Redeploy and test Create Account, Login, and Logout. Never send your password or private account credentials to anyone.

Important: online authentication only confirms who is signed in. This version still stores game progress locally on the device; cloud save syncing is not included.
