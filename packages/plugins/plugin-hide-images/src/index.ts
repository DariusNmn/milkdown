import type { MilkdownPlugin } from '@milkdown/ctx'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import { $ctx, $command, $prose } from '@milkdown/utils'

/// Configuration for hide images plugin.
export interface HideImagesOptions {
  /// Whether to hide inline images.
  hideInlineImages: boolean
  /// Whether to hide image blocks.
  hideImageBlocks: boolean
  /// CSS class to apply to hidden images (default: 'milkdown-hidden-image').
  hiddenClass: string
}

/// State to track if images are currently hidden.
export const hideImagesState = $ctx<boolean, 'hideImagesState'>(
  false,
  'hideImagesState'
)

hideImagesState.meta = {
  package: '@milkdown/plugin-hide-images',
  displayName: 'Ctx<hideImagesState>',
}

/// Config for hide images plugin.
export const hideImagesConfig = $ctx<HideImagesOptions, 'hideImagesConfig'>(
  {
    hideInlineImages: true,
    hideImageBlocks: true,
    hiddenClass: 'milkdown-hidden-image',
  },
  'hideImagesConfig'
)

hideImagesConfig.meta = {
  package: '@milkdown/plugin-hide-images',
  displayName: 'Ctx<hideImagesConfig>',
}

/// Command to toggle hiding images.
/// Note: The command updates the context state. To trigger decoration updates,
/// dispatch a transaction with meta after calling this command.
export const toggleHideImagesCommand = $command('ToggleHideImages', (ctx) => {
  return () => {
    const currentState = ctx.get(hideImagesState.key)
    ctx.update(hideImagesState.key, () => !currentState)
    return true
  }
})

toggleHideImagesCommand.meta = {
  package: '@milkdown/plugin-hide-images',
  displayName: 'Command<toggleHideImages>',
}

/// The prosemirror plugin for hiding images.
export const hideImagesPlugin = $prose((ctx) => {
  const pluginKey = new PluginKey('MILKDOWN_HIDE_IMAGES')
  
  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return { isHidden: ctx.get(hideImagesState.key), decorations: DecorationSet.empty }
      },
      apply(transaction, value, oldState, newState) {
        // Always read from context state to stay in sync
        // Check if hide state changed via meta first, then fall back to context
        const meta = transaction.getMeta(pluginKey)
        const contextState = ctx.get(hideImagesState.key)
        const isHidden = meta?.isHidden !== undefined ? meta.isHidden : contextState
        
        // Always recalculate decorations if state changed or document changed
        const stateChanged = isHidden !== value.isHidden
        
        if (stateChanged || transaction.docChanged) {
          const config = ctx.get(hideImagesConfig.key)
          const decorations: Decoration[] = []

          if (isHidden) {
            // Traverse the entire document to find all images
            newState.doc.descendants((node, pos) => {
              // Hide inline images
              if (
                config.hideInlineImages &&
                node.type.name === 'image' &&
                node.isInline
              ) {
                const decoration = Decoration.node(
                  pos,
                  pos + node.nodeSize,
                  {
                    class: config.hiddenClass,
                    style: 'display: none;',
                  }
                )
                decorations.push(decoration)
              }

              // Hide image blocks
              if (
                config.hideImageBlocks &&
                node.type.name === 'image-block' &&
                node.isBlock
              ) {
                const decoration = Decoration.node(
                  pos,
                  pos + node.nodeSize,
                  {
                    class: config.hiddenClass,
                    style: 'display: none;',
                  }
                )
                decorations.push(decoration)
              }
            })
          }

          return {
            isHidden,
            decorations: decorations.length > 0 
              ? DecorationSet.create(newState.doc, decorations)
              : DecorationSet.empty
          }
        }

        // Map decorations through transaction
        return {
          isHidden: value.isHidden,
          decorations: value.decorations.map(transaction.mapping, transaction.doc)
        }
      },
    },
    props: {
      decorations(this: Plugin, state) {
        return this.getState(state).decorations
      },
    },
  })
})

hideImagesPlugin.meta = {
  package: '@milkdown/plugin-hide-images',
  displayName: 'Prose<hideImages>',
}

/// All plugins exported by this package.
export const hideImages: MilkdownPlugin[] = [
  hideImagesPlugin,
  hideImagesConfig,
  hideImagesState,
  toggleHideImagesCommand,
]

