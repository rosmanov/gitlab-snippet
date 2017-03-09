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
- `agentOptions`: [User agent options for HTTPS](https://github.com/request/request#using-optionsagentoptions)

### HTTPS

If the Gitlab server is accessed via HTTPS, and the certificate is not signed by generally accepted certificate authorities (CAs), then the `agentOptions` should be configured accordingly. The following is a list of possible `agentOptions` keys:

- `ca`: Path to CA's certificate file;
- `key`: Path to the private key file;
- `passphrase`: Passphrase for the private key file.

All paths must be absolute. It is allowed to use _tilde_ character in place of the home directory path, e.g. `~/etc/cert/myhost.pem`.

**Steps to Configure a Self-Signed Certificate**

Download the certificate:

```shell
mkdir -p ~/etc/cert
openssl s_client -showcerts -connect gitlab.vpn.host:443 </dev/null 2>/dev/null | \
  openssl x509 -outform PEM > ~/etc/cert/gitlab.vpn.host.pem
```
Provide the path to it in the configuration file:

```json
{
  "agentOptions": {
    "ca": "~/etc/cert/gitlab.vpn.host.pem"
  }
}
```
Alternatively, set the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable to zero, e.g.:

    export NODE_TLS_REJECT_UNAUTHORIZED=0;

### Sample Configuration

```json
{
  "token": "abcdefghijklmn123456",
  "host": "gitlab.vpn.host"
}

{
  "token": "abcdefghijklmn123456",
  "host": "gitlab.vpn.host"
  "project": "group/some-project",
  "agentOptions": {
    "ca": "~/etc/cert/gitlab.vpn.host.pem"
  }
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
