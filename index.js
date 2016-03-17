#!/usr/bin/env node
/**
 * Gitlab snippet maker.
 * @author Ruslan Osmanov <rrosmanov@gmail.com>
 * @copyright Megagroup.ru 2016
 */

var ARGV = require('minimist')(process.argv.slice(2));
var FS = require('fs');
var REQUEST = require('request');

var GITLAB_API_TOKEN; // Access token
var GITLAB_API_HOST; // Gitlab hostname
var GITLAB_API_URL;
var VISIBILITY_LEVEL = 20; // Snippet visibility (20 - public)
var FILENAME; // Source file path
var DEFAULT_CONF_FILE = process.env.HOME + '/.config/gitlab-snippet.json';
var CONF_FILE; // Configuration file path
var PROJECT_PATH_WITH_NAMESPACE; // Gitlab project path with namespace, e.g. 'path/ns'
var LANG; // Source file programming language


if (ARGV.h === true || ARGV.help === true) {
  usage(0);
}

if (ARGV._.length <= 0) {
  console.error("filename expected");
  usage(1);
}

LANG = ARGV.l || ARGV.lang || null;

PROJECT_PATH_WITH_NAMESPACE = ARGV.p || ARGV.project || process.env.GITLAB_SNIPPET_PROJECT;
if (PROJECT_PATH_WITH_NAMESPACE === null) {
  console.error("Project path/namespace, or project ID required");
  usage(1);
}

run();

/////////////////////////////////////////////////////////////////////
// Functions

/**
 * @param Integer exitCode Process exit code
 * @return Void
 */
function usage(exitCode) {
  var msg = "Creates a Gitlab snippet\n\n" +
    process.argv[1] + " [OPTIONS] FILENAME\n\n" +
    "FILENAME:      Path to the source file, or `-' for STDIN.\n\n" +
    "OPTIONS:\n" +
    "-h, --help     This help message\n" +
    "-c, --conf     Config file. Default: " + DEFAULT_CONF_FILE + "\n" +
    "-p, --project  Project 'path/namespace', or numeric project ID\n" +
    "-l, --lang     Language(filename extension such as php, js, pl etc.). Useful when input is STDIN.\n" ;

  if (exitCode) {
    console.error(msg, exitCode);
  } else {
    console.log(msg);
  }

  process.exit(exitCode);
}

/**
 * @param String msg
 * @param Integer errCode
 */
function fatalError(msg, errCode) {
  console.error(msg, errCode || 0)
  process.exit(1);
}

function run() {
  CONF_FILE = ARGV.c || ARGV.config || DEFAULT_CONF_FILE;
  FS.access(CONF_FILE, FS.R_OK, onAccessConfigFile);
}

/**
 * Callback for async access to the configuration file
 * @param String err
 * @return Void
 */
function onAccessConfigFile(err) {
  var conf;

  if (!err) {
    conf = require(CONF_FILE);
    GITLAB_API_TOKEN = conf.token;
    GITLAB_API_HOST = conf.host;
    if (!PROJECT_PATH_WITH_NAMESPACE && conf.project !== undefined) {
      PROJECT_PATH_WITH_NAMESPACE = conf.project;
    }
  } else {
    // Config file is not available. Try to fetch from the environment.
    GITLAB_API_TOKEN = process.env.GITLAB_SNIPPET_TOKEN;
    GITLAB_API_HOST = process.env.GITLAB_SNIPPET_HOST;
  }

  if (!GITLAB_API_TOKEN) {
    fatalError('failed to fetch access token from configuration');
  }

  if (!GITLAB_API_HOST) {
    fatalError('failed to fetch API host from configuration');
  }

  GITLAB_API_URL = 'http://' + GITLAB_API_HOST + '/api/v3';

  FILENAME = ARGV._[0];
  FS.access(FILENAME, FS.R_OK, onAccessFile);
}

/**
 * Callback for async access to the source file
 * @param String err
 * @return Void
 */
function onAccessFile(err) {
  if (err && FILENAME != '-') {
    fatalError("file is not accessible: " + FILENAME, err);
  }

  getProject(PROJECT_PATH_WITH_NAMESPACE, onGetProject);
}

/**
 * Is called when the create-snippet API command finishes.
 * @param Object r
 */
function onCreateSnippet(r) {
  if (r.id === undefined) {
    fatalError("Failed to parse response: " + body);
  }

  console.log('http://' + GITLAB_API_HOST + '/' + PROJECT_PATH_WITH_NAMESPACE  + '/snippets/' + r.id);
}

/**
 * Is called when the get-project API command finishes.
 * @param Object r
 */
function onGetProject(r) {
  if (r.id === undefined) {
    fatalError("failed to fetch project ID from response");
  }

  createSnippet(r.id, FILENAME, onCreateSnippet);
}

/**
 * @return Object Common HTTP headers
 */
function getCommonHttpHeaders() {
  return {
    "PRIVATE-TOKEN": GITLAB_API_TOKEN
  };
}

/**
 * @param Function callback
 * @param Variant json JSON string or object
 */
function callbackCall(callback, json) {
  try {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    callback(json);
  } catch (e) {
    fatalError("failed to parse JSON: " + e.message);
  }
}

function createSnippet(projectId, filename, callback) {
  var url, data, code, suffix;

  url = GITLAB_API_URL + '/projects/' + projectId + '/snippets';

  suffix = LANG ? '.' + LANG.toLowerCase() : '';

  function post() {
    data = {
      id: projectId,
      title: filename,
      file_name: filename + suffix,
      visibility_level: VISIBILITY_LEVEL,
      code: code
    };

    REQUEST.post({
      url: url,
      formData: data,
      headers: getCommonHttpHeaders()
    }, function (error, res, body) {
      if (error) {
        fatalError('upload failed: ', error);
      }

      callbackCall(callback, body);
    });
  }

  if (filename == '-') {
    code = '';
    filename = 'stdin';

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function () {
      var chunk = process.stdin.read();
      if (chunk !== null) {
        code += chunk;
      }
    });
    process.stdin.on('end', post);
  } else {
    code = FS.createReadStream(filename);
    post();
  }
}

/**
 * @param Variant id The ID or NAMESPACE/PROJECT_NAME of a project
 * @param Function callback
 */
function getProject(id, callback) {
  var url = GITLAB_API_URL + '/projects/' + encodeURIComponent(id);

  REQUEST.get({
    url: url,
    headers: getCommonHttpHeaders()
  }, function (error, res, body) {
    if (error) {
      fatalError('failed to get project '  + id + ': ', error);
    }

    callbackCall(callback, body);
  });
}
