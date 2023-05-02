#!/usr/bin/env node

// Installs a platform/arch appropriate binary for errata-ai/vale.

'use strict'

const axios       = require('axios')
const decompress  = require('decompress')
const fs          = require('fs')
const path        = require('path')

const cwd = process.env.INIT_CWD
  ? process.env.INIT_CWD
  : process.cwd()

const arch = process.arch
const platform = process.platform

const valeVersion = '2.25.2'
const targetFolder = 'bin'

// Returns the release-specific platform string based on platform
const mapPlatform = (map = {}) => {
  if (!(platform in map)) return null
  return map[platform]
}

// Returns the release-specific arch string based on arch
const mapArch = (map = {}) => {
  if (!(arch in map)) return null
  return map[arch]
}

const getRelease = (user, repo, version, platform, arch, ext, targetDir) => {
  if (ext !== 'tar.gz' && ext !== 'zip') {
    console.log(`Don't know how to handle a .${ext} file!`)
    return
  }

  const url = `https://github.com/${user}/${repo}/releases/download/v${version}/${repo}_${version}_${platform}_${arch}.${ext}`

  console.log(`Installing ${user}/${repo} into ${targetFolder}`)
  const res = axios
    .get(url, { responseType: 'arraybuffer' })
    .then((res) => {
      decompress(res.data, path.join(cwd, targetFolder))
        .then((files) => {
          fs.rmSync(path.join(cwd, targetFolder, 'LICENSE'))
          fs.rmSync(path.join(cwd, targetFolder, 'README.md'))
        })
        .catch((err) => {
          console.log(`Decompress error:`, err)
        })
    })
    .catch((err) => console.log(`Download error:`, err))
}

const vale = async () => {
  const p = mapPlatform({
    'darwin': 'macOS',
    'linux': 'Linux',
    'win32': 'Windows'
  })

  const a = mapArch({
    'x64': '64-bit',
    'arm64': 'arm64',
  })

  if (!p || !a) {
    console.log(`No htmltest release available for $${platform}/${arch}.`)
    return
  }

  const ext = (p === 'Windows') ? 'zip' : 'tar.gz'
  getRelease('errata-ai', 'vale', valeVersion, p, a, ext, targetFolder)
}

vale()
