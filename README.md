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


## V5 expanded systems update
- Camp rest now uses a visible 30-second countdown. Health and mana restore only when it completes; the rest button is locked during the countdown.
- Character preview now includes an optional Three.js procedural 3D miniature with drag rotation and race/class-inspired styling. This is a lightweight procedural model, not a professionally sculpted downloadable character asset.
- Guild board includes the original contracts plus 42 generated region-hunting contracts (50+ total entries).
- Guild Shop has additional weapons with attack, attribute, mana, and critical-hit bonuses.
- Boss arena now cycles through a roster of ten bosses with escalating level requirements and rewards.
- The Three.js renderer loads from jsDelivr, so the live browser needs an internet connection for the 3D preview. If the CDN is blocked, the existing CSS character preview remains available.


## V5 improvement update
- Added a local **Reset Character** control. It clears this device's character and local game save after confirmation. It does not delete a Firebase account.
- Added a separate **Delete Online Account** action. This only works after Firebase is configured and an online user is signed in; Firebase may require a fresh login.
- Guild Shop now has category filters for weapons, armor, accessories, potions/tonics, materials, and rare items.
- Level-ups award skill points. Reach level 3 and spend one point to unlock Rift Strike, which boosts skill damage.
- Quest Board is now collapsible and remembers whether it was open.
- The 30-second camp recovery timer remains in place.

Note: online authentication is still disabled until you add your own Firebase web configuration in `auth.js`. The game save remains local to the current device/browser.
