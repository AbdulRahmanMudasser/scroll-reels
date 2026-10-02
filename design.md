# Scroll Reels visual direction

**source**: image

## Character

Scroll Reels is a compact, flat timer label for the Instagram Reels surface and a restrained settings panel in the extension popup. The timer sits at the top right of the Reel, while Instagram owns the navigation buttons. Clicking the timer opens the extension popup. The popup uses a compact header and one flat bordered panel of timer settings.

## Build mandate

Use only black, white, red, and blue in the extension theme. White is the popup and timer surface. Black is the main text, border color, and primary action. Blue marks running state and focused controls. Red marks completed states and focus rings. Do not add custom Reel up/down controls, drop shadows, elevations, offset-card effects, popup section headings, or a popup tip block.

## Tokens

The source of truth for color tokens is `src/popup.css` and `src/content.css`. Keep future visual changes in those token declarations instead of adding new color literals.
