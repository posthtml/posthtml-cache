# posthtml-cache

> A posthtml plugin for add nanoid to style & script links and you tags...

[![Travis Build Status](https://img.shields.io/travis/posthtml/posthtml-cache.svg?style=flat-square&label=unix)](https://travis-ci.org/posthtml/posthtml-cache)[![node](https://img.shields.io/node/v/posthtml-cache.svg?style=flat-square)]()[![npm version](https://img.shields.io/npm/v/posthtml-cache.svg?style=flat-square)](https://www.npmjs.com/package/posthtml-cache)[![Dependency Status](https://david-dm.org/posthtml/posthtml-cache.svg?style=flat-square)](https://david-dm.org/posthtml/posthtml-cache)[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg?style=flat-square)](https://github.com/sindresorhus/xo)[![Coveralls status](https://img.shields.io/coveralls/posthtml/posthtml-cache.svg?style=flat-square)](https://coveralls.io/r/posthtml/posthtml-cache)

## Why?

## Install

```bash
npm i -S posthtml posthtml-cache
```

> **Note:** This project is compatible with node v10+

## Usage

```js
import {readFileSync, writeFileSync} from 'fs';
import posthtml from 'posthtml';
import posthtmlCache from 'posthtml-cache';

const html = readFileSync('input.html', 'utf8');

posthtml()
  .use(posthtmlCache(/* options */))
  .process(html)
  .then(result => {
    writeFileSync('output.html', result.html);
  });

```

## Example

input.html
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <img data-src="logo.svg" alt="">
    <script src="script.js"></script>
  </body>
<html>
```

output.html
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css?v=4f90d13a42">
  </head>
  <body>
    <img data-src="logo.svg?v=VlLqCweTvn_E1g3XXGMtM" alt="">
    <script src="script.js?v=93ce_Ltuub"></script>
  </body>
<html>
```
> *will be added nanoid to all the file link*

## Options

### `tags`
Type: `Array`  
Default: `['script', 'link']`  
Description: *You can also expand the list by adding the tags you need...*  

### `attributes`
Type: `Array`  
Default: `['src', 'href']` 
Description: *You can also expand the list by adding the attributes you need...*  

### `exclude`
Type: `Array`  
Default: `[]`  
Description: *You can also exclude the list by adding the tags you need...*  
