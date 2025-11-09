import type { Meta, StoryObj } from '@storybook/html'

import { EditorStatus, commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import { imageBlockComponent } from '@milkdown/kit/component/image-block'
import { imageInlineComponent } from '@milkdown/kit/component/image-inline'
import { PluginKey } from '@milkdown/kit/prose/state'
import { callCommand } from '@milkdown/kit/utils'
import {
  hideImages,
  hideImagesConfig,
  hideImagesState,
  toggleHideImagesCommand,
} from '@milkdown/plugin-hide-images'

import type { CommonArgs } from '../utils/shadow'

import { setupMilkdown } from '../utils/shadow'
import style from './hide-images.css?inline'

const meta: Meta<CommonArgs> = {
  title: 'Plugins/Hide Images',
}

export default meta

type Story = StoryObj<CommonArgs>

const contentWithImages = `
# Testing Hide Images Plugin

This document contains both inline images and image blocks.

## Inline Image

Here's an inline image: ![typescript](/typescript-label.svg)

And here's another one: ![logo](/milkdown-logo.png)

## Image Block

![0.5](/milkdown-logo.png)

This is some text after the image block.

![1.0](/milkdown-logo.png)

More content here.
`

export const WithToggleButton: Story = {
  render: (args) => {
    const root = setupMilkdown([style], args, (editor, _, wrapper) => {
      editor
        .use(imageBlockComponent)
        .use(imageInlineComponent)
        .use(hideImages)
        .config((ctx) => {
          // Hide both inline images and image blocks
          ctx.update(hideImagesConfig.key, (prev) => ({
            ...prev,
            hideInlineImages: true,
            hideImageBlocks: true,
          }))
        })

      // Add toggle button
      editor.onStatusChange((status) => {
        if (status === EditorStatus.Created) {
          const buttonContainer = document.createElement('div')
          buttonContainer.style.cssText =
            'padding: 10px; border-bottom: 1px solid #e0e0e0; background: #f5f5f5;'
          buttonContainer.className = 'hide-images-toggle-container'

          const button = document.createElement('button')
          button.textContent = 'Hide Images'
          button.style.cssText =
            'padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;'
          button.className = 'hide-images-toggle-button'

          // Update button text based on state
          const updateButton = () => {
            const isHidden = editor.ctx.get(hideImagesState.key)
            button.textContent = isHidden ? 'Show Images' : 'Hide Images'
            button.style.background = isHidden ? '#28a745' : '#007bff'
          }

          button.addEventListener('click', () => {
            editor.action((ctx) => {
              // Get current state and toggle it
              const currentState = ctx.get(hideImagesState.key)
              const newState = !currentState
              
              // Update the context state
              ctx.update(hideImagesState.key, () => newState)
              
              // Get view and plugin key
              const view = ctx.get(editorViewCtx)
              const pluginKey = new PluginKey('MILKDOWN_HIDE_IMAGES')
              
              // Update button
              button.textContent = newState ? 'Show Images' : 'Hide Images'
              button.style.background = newState ? '#28a745' : '#007bff'
              
              // Dispatch transaction with meta to trigger decoration update
              view.dispatch(view.state.tr.setMeta(pluginKey, { isHidden: newState }))
            })
          })

          updateButton()
          buttonContainer.appendChild(button)
          wrapper.insertBefore(buttonContainer, wrapper.firstChild)
        }
      })
    })
    return root
  },
  args: {
    defaultValue: contentWithImages,
    readonly: false,
  },
}

export const HideAllImages: Story = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor
        .use(imageBlockComponent)
        .use(imageInlineComponent)
        .use(hideImages)
        .config((ctx) => {
          // Hide both inline images and image blocks
          ctx.update(hideImagesConfig.key, (prev) => ({
            ...prev,
            hideInlineImages: true,
            hideImageBlocks: true,
          }))
          // Start with images hidden
          ctx.set(hideImagesState.key, true)
        })
    })
  },
  args: {
    defaultValue: contentWithImages,
    readonly: false,
  },
}

export const HideOnlyInlineImages: Story = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor
        .use(imageBlockComponent)
        .use(imageInlineComponent)
        .use(hideImages)
        .config((ctx) => {
          // Only hide inline images, keep image blocks visible
          ctx.update(hideImagesConfig.key, (prev) => ({
            ...prev,
            hideInlineImages: true,
            hideImageBlocks: false,
          }))
        })
    })
  },
  args: {
    defaultValue: contentWithImages,
    readonly: false,
  },
}

export const HideOnlyImageBlocks: Story = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor
        .use(imageBlockComponent)
        .use(imageInlineComponent)
        .use(hideImages)
        .config((ctx) => {
          // Only hide image blocks, keep inline images visible
          ctx.update(hideImagesConfig.key, (prev) => ({
            ...prev,
            hideInlineImages: false,
            hideImageBlocks: true,
          }))
        })
    })
  },
  args: {
    defaultValue: contentWithImages,
    readonly: false,
  },
}

export const ShowAllImages: Story = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor.use(imageBlockComponent).use(imageInlineComponent)
      // Don't use hideImages plugin at all
    })
  },
  args: {
    defaultValue: contentWithImages,
    readonly: false,
  },
}

