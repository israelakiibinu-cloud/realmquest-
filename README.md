# RealmQuest V5 — Character Creator

## What's new
- Avatar appearance studio: avatar emoji, aura colour, hairstyle, face, outfit and weapon style.
- Playable races: Human, Elf, Demon, Dragonkin and Dwarf, each with attribute bonuses.
- Strength, Intelligence, Agility, Vitality and Luck attributes, plus spendable points.
- Mana-based Arcane Burst, login/auth scaffold and existing adventure features.

## Publish the update
Upload every file in this `realmquest` folder to the root of your existing GitHub repository, replacing files with the same names. Add the new `character.js` file too. Wait for Render to redeploy.

## Notes
Character appearance/race/attributes currently save in this browser using localStorage. Online authentication needs the Firebase configuration described in `auth.js`; these character attributes are not yet synchronised to a cloud database or other devices. Attribute totals show race bonuses; this prototype does not yet apply every attribute to battle calculations.


## Mana rules
Mage, Summoner, and Necromancer start with 100/100 MP. Swordsman and Assassin start with 50/50 MP. Choosing a mana-focused class restores MP to 100. Resting at camp restores both HP and MP.
