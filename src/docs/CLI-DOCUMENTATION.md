# Block Convert CLI Documentation

## Overview

The Block Convert CLI is a command-line tool that converts HTML template files to WordPress GenerateBlocks format. It uses a modular provider-based architecture to handle different types of HTML elements and convert them to appropriate WordPress blocks.

## Architecture

### Core Components

1. **CLI Layer** (`src/cli/cli.js`)
   - Command-line interface using Commander.js
   - Handles user input, options, and output formatting
   - Provides commands for conversion, listing, and information

2. **BlockConverter** (`src/cli/BlockConverter.js`)
   - File system operations and batch processing
   - Scans blocks directory for template files
   - Manages conversion statistics and error handling
   - Supports dry-run mode and verbose output

3. **HtmlToBlocksConverter** (`src/core/HtmlToBlocksConverter.js`)
   - Core conversion engine using JSDOM
   - Transforms HTML DOM elements to WordPress blocks
   - Generates block comment syntax
   - Handles options like class preservation and unique IDs

4. **ProviderManager** (`src/core/ProviderManager.js`)
   - Manages conversion providers by priority
   - Routes DOM elements to appropriate providers
   - Handles fallback scenarios

### Provider System

The system supports three provider modes:

- **`gutenberg`**: Native WordPress blocks (core/paragraph, core/heading, etc.)
- **`generate`**: GenerateBlocks plugin blocks only
- **`generate-pro`**: GenerateBlocks + GenerateBlocks Pro blocks (default)

Available providers:
- **GenerateBlocks**: Element, Text, Button, Media, Shape, Query
- **GenerateBlocks Pro**: Tabs, Accordion, Navigation
- **Gutenberg**: Image, Table, List, Quote, Paragraph, Heading
- **Fallback**: Handles unmatched elements

## Commands

### `convert`
Convert all template.html files to block.html files.

```bash
node src/cli/cli.js convert [options]
```

**Options:**
- `-d, --blocks-dir <dir>` - Blocks directory path (default: ./blocks)
- `--generate` - Use only GenerateBlocks providers
- `--generate-pro` - Use GenerateBlocks + Pro providers (default)
- `--gutenberg` - Use native Gutenberg block providers
- `--no-classes` - Do not preserve CSS classes
- `--no-unique-ids` - Do not generate unique IDs
- `--no-semantic` - Disable semantic mapping
- `-v, --verbose` - Verbose output
- `--dry-run` - Preview changes without writing files

### `convert-block <name>`
Convert a specific block by name.

```bash
node src/cli/cli.js convert-block hero [options]
```

**Options:**
- `-d, --blocks-dir <dir>` - Blocks directory path (default: ./blocks)
- `--no-classes` - Do not preserve CSS classes
- `--no-unique-ids` - Do not generate unique IDs
- `--no-semantic` - Disable semantic mapping
- `-v, --verbose` - Verbose output (always enabled for single block)
- `--dry-run` - Preview changes without writing files

### `list`
List all available blocks.

```bash
node src/cli/cli.js list [options]
```

**Options:**
- `-d, --blocks-dir <dir>` - Blocks directory path (default: ./blocks)
- `-v, --verbose` - Show detailed information

### `info`
Show system information and usage examples.

```bash
node src/cli/cli.js info
```

## File Structure

The CLI expects the following directory structure:

```
blocks/
├── block-name-1/
│   ├── template.html    # Source HTML (required)
│   ├── template.css     # Styles (optional)
│   ├── template.js      # Scripts (optional)
│   ├── block.html       # Generated minified blocks
│   └── unminified.html  # Generated unminified blocks
└── block-name-2/
    └── template.html
```

## Conversion Process

1. **Discovery**: Scans blocks directory for folders containing `template.html`
2. **Parsing**: Uses JSDOM to convert HTML string to DOM tree
3. **Provider Matching**: Routes each DOM element to highest-priority matching provider
4. **Block Generation**: Providers convert elements to WordPress block format
5. **Serialization**: Generates WordPress block comment syntax
6. **Output**: Creates both minified (`block.html`) and unminified (`unminified.html`) files

## Usage Examples

### Convert all blocks with GenerateBlocks
```bash
node src/cli/cli.js convert --generate
```

### Convert specific block with verbose output
```bash
node src/cli/cli.js convert-block hero --verbose
```

### Dry run to preview changes
```bash
node src/cli/cli.js convert --dry-run --verbose
```

### List all available blocks
```bash
node src/cli/cli.js list --verbose
```

## Block Output Format

The CLI generates WordPress block comment syntax:

```html
<!-- wp:generateblocks/element {"uniqueId":"abc123","tagName":"div","globalClasses":["hero-section"],"blockId":"block-abc123"} -->
<div class="gb-element hero-section">Content here</div>
<!-- /wp:generateblocks/element -->
```

## Error Handling

The CLI provides detailed error messages and statistics:
- Successful conversions count
- Failed conversions with reasons
- File system errors
- Provider matching failures
- Validation errors

## Development

To add new providers:
1. Create provider class implementing `canHandle()` and `convert()` methods
2. Register provider in ProviderManager with appropriate priority
3. Test with various HTML structures

## Configuration

No configuration files required. All options are passed via command-line flags.