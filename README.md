# @ubiquity-os/action-deploy-plugin

Update Manifest, build and commit the changes signing the commit payload.

## Description

This GitHub Action automates the process of checking out a repository, setting up Node.js, installing dependencies, updating the `manifest.json` file, formatting it, and committing/pushing the changes with a signed commit.

## Inputs

- **`manifest-path`**:
    - **Description**: The path to the `manifest.json` file.
    - **Required**: No
    - **Default**: `${{ github.workspace }}/manifest.json`

- **`schema-path`**:
    - **Description**: The path to the plugin settings schema.
    - **Required**: No
    - **Default**: `${{ github.workspace }}/src/types/plugin-input.js`

- **`plugin-entry`**:
    - **Description**: The path to the plugin entry file.
    - **Required**: No
    - **Default**: `${{ github.workspace }}/src/index.ts`

- **`commit-message`**:
    - **Description**: The commit message.
    - **Required**: No
    - **Default**: `chore: updated manifest.json`

- **`node-version`**:
    - **Description**: The version of Node.js to use.
    - **Required**: No
    - **Default**: `20.10.0`

## Steps

1. **Check out the repository**:
   Uses the `actions/checkout@v4` action to check out the repository.

2. **Set up Node.js**:
   Uses the `actions/setup-node@v4` action to set up a specified version of Node.js.

3. **Import GPG key (optional)**:
   If a GPG private key is provided, imports it and configures Git to use it for signing commits.

4. **Install dependencies**:
   Runs `yarn install` to install the project's dependencies with immutable and cache check settings.

5. **Compile TypeScript files**:
   Compiles the TypeScript files using `yarn tsc` with the specified project configuration.

6. **Build project**:
   Adds the `@vercel/ncc` package and builds the project using `ncc`.

7. **Update manifest configuration JSON**:
   Updates the `manifest.json` file with the plugin settings schema.

8. **Format manifest using Prettier**:
   Installs Prettier and formats the `manifest.json` file and other project files.

9. **Commit and Push changes**:
   Configures Git, adds the updated files to the commit, and pushes the changes to the repository.

## Usage Example

```yaml
name: Update Manifest and Commit Changes

on:
  push:

jobs:
  update-manifest:
    runs-on: ubuntu-latest
    steps:
      - name: Update Manifest and Commit Changes
        uses: ubiquity-os/action-deploy-plugin@main
        with:
          manifest-path: ${{ github.workspace }}/manifest.json
          schema-path: ${{ github.workspace }}/src/types/plugin-input.js
          plugin-entry: ${{ github.workspace }}/src/index.ts
          commit-message: "chore: updated manifest.json"
          node-version: "20.10.0"
        env:
          GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
          GPG_PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
```

## Features

- Clones the repository and sets up Node.js.
- Imports a GPG key to sign commits (if provided).
- Installs project dependencies and compiles TypeScript files.
- Builds the project using `@vercel/ncc`.
- Updates the `manifest.json` file.
- Formats the project files using Prettier.
- Commits and pushes changes to the repository.
