# RealmQuest V5 — Character, Quest & Guild Shop Update

## Player flow
- Intro page → one-time character creation → game.
- Race and class are selected during first character creation and become permanent after entering the realm.
- The in-game screen no longer links back to character creation, so race/class selection does not appear again during normal play.
- Guest play and local saves work without Firebase setup. Online login remains optional and requires your own Firebase configuration.

## Character creation
- CSS-built 3D-style character preview with layered body parts, depth, lighting, outfit styles, weapon display and race-specific details.
- Preview updates when race, class, hairstyle, face, outfit, weapon style or aura changes.
- Drag/swipe the preview horizontally to rotate the character.
- Five races and five classes with starting attribute bonuses.
- Strength, Intelligence, Agility, Vitality and Luck, with three points to assign before entering the realm.
- This is a lightweight CSS 3D-style model, not a full polygonal/WebGL character editor; it runs without a 3D library or external assets.

## Gameplay
- Three regions: Whispering Wilds, Crystal Caverns and Ancient Ruins, each with distinct enemies and reward scaling.
- Class-based physical and magic attacks, critical hits, enemy turns, potions, rest and level progression.
- Seven quest-board contracts with progress tracking and automatic Guild Coin/XP rewards.
- Beginner's Trial: defeat three creatures for additional Guild Coins and XP.
- Boss challenge: Ashfang, Rift Drake, unlocked at level 3.
- Monster drops and equipment bonuses.

## Guild Shop
- Spend Guild Coins earned from monsters and quests.
- Five weapons with different attack, Strength, Intelligence, Agility, Vitality, Luck, critical-hit and mana attributes.
- Purchased weapons equip immediately and their attack/stat bonuses affect combat.
- Current weapon and shop purchases persist in the local save.

## Deploy the update
1. Download and extract `RealmQuest_V5_Character_Quests_Shop.zip`.
2. Open the existing GitHub repository used by Render.
3. Replace the matching files in the existing `realmquest` folder with the files from the ZIP. Do not create a second nested `realmquest/realmquest` folder.
4. Commit the changes and wait for Render to redeploy.
5. Open the live site and test the intro → character creation → game flow, quest board and Guild Shop.

## Saving and accounts
- Character, quest progress, equipment and adventure progress save in this browser using `localStorage`.
- Progress does not sync to other devices until a cloud-save backend is built.
- Online email/password authentication needs a Firebase project and valid configuration in `auth.js`. Never share passwords or private account credentials.

## Testing notes
- This update is packaged for the existing V5 frontend. After deployment, test the live Render build on mobile and desktop before treating it as production-ready.
