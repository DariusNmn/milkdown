# @milkdown/plugin-hide-images

A plugin for Milkdown that hides images using decorations.

## Usage

```typescript
import { Editor, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { hideImages, hideImagesConfig } from '@milkdown/plugin-hide-images'

Editor.make()
  .config((ctx) => {
    ctx.set(rootCtx, document.getElementById('app'))
    // Configure which images to hide
    ctx.update(hideImagesConfig.key, (prev) => ({
      ...prev,
      hideInlineImages: true, // Hide inline images
      hideImageBlocks: true,   // Hide image blocks
      hiddenClass: 'milkdown-hidden-image', // CSS class to apply
    }))
  })
  .use(commonmark)
  .use(hideImages)
  .create()
```

## Configuration

- `hideInlineImages`: Whether to hide inline images (default: `true`)
- `hideImageBlocks`: Whether to hide image blocks (default: `true`)
- `hiddenClass`: CSS class to apply to hidden images (default: `'milkdown-hidden-image'`)

The plugin uses ProseMirror decorations to apply `display: none` style to images, effectively hiding them from view while keeping them in the document structure.

