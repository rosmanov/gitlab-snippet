# Gitlab Snippet

Utility for Gitlab snippets.

# Installation

```
# npm install gitlab-snippet -g
```

# Usage

Configuration is passed through configuration file, environment variables, and the command line arguments.

## Configuration File

Path to the configuration file is passed via `-c (--config)` command line argument.
Default path is `$HOME/.config/gitlab-snippet.json`.

### Format

JSON

### Keys

- `host`: The Gitlab host
- `token`: The Gitlab access token
- `project`: The Gitlab project 'path/namespace', or numeric project ID.

### Example

```json
{
  "token": "abcdefghijklmn123456",
  "host": "gitlab.vpn.host"
}
```

## Environment Variables

- *GITLAB_SNIPPET_TOKEN*: The Gitlab host.
- *GITLAB_SNIPPET_HOST*: The Gitlab access token.
- *GITLAB_SNIPPET_PROJECT*: The Gitlab project 'path/namespace', or numeric project ID.

## Command Line Arguments

Run the command with `-h (--help)` for reference.

# Examples

## Create Snippet from a File
```
gitlab-snippet -p s3/s3 test.php
```

## Create Snippet from STDIN
```
echo '<?php echo 'hello';' | gitlab-snippet -p s3/s3 -l php -
```

## Using Environment Variables
```
export GITLAB_SNIPPET_HOST='gitlab.vpn.host'
export GITLAB_SNIPPET_TOKEN='abcdefghijklmn123456'
export GITLAB_SNIPPET_PROJECT='path/ns'

gitlab-snippet test.php
```

# License

MIT
