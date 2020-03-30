import test from 'ava';
import posthtml from 'posthtml';
import parser from 'posthtml-parser';
import isPromise from 'is-promise';
import queryString from 'query-string';
import {nanoid} from 'nanoid';
import plugin from '../src';

function processing(html, options) {
  return posthtml()
    .use(plugin(options))
    .process(html);
}

test('plugin must be function', t => {
  t.true(typeof plugin === 'function');
});

test('should return reject', async t => {
  const error = await t.throwsAsync(plugin()());
  t.is(error.message, 'tree is not Array');
});

test('should return promise', t => {
  t.true(isPromise(processing('')));
});

test('should add nanoid to style links', async t => {
  const input = '<link rel="stylesheet" href="style.css">';
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'href');
  t.truthy(id);
  t.is(url, 'style.css');
  t.is(id.length, 21);
});

test('should add nanoid to script links', async t => {
  const input = '<script src="script.js"></script>';
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'src');
  t.truthy(id);
  t.is(url, 'script.js');
  t.is(id.length, 21);
});

test('should add nanoid to iframe links', async t => {
  const input = '<iframe src="index.html"></iframe>';
  const html = (await processing(input, {tags: ['iframe']})).html;

  const {url, id} = getParts(html, 'src');
  t.truthy(id);
  t.is(url, 'index.html');
  t.is(id.length, 21);
});

test('should exclude tag links', async t => {
  const input = '<iframe src="index.html"></iframe><link rel="stylesheet" href="style.css">';
  const html = (await processing(input, {tags: ['iframe'], exclude: ['link']})).html;
  const [iframe, link] = parser(html);
  const iframeID = queryString.parse(iframe.attrs.src.split('?')[1]).v;
  const linkID = queryString.parse(link.attrs.href.split('?')[1]).v;
  t.truthy(iframeID);
  t.falsy(linkID);
  t.is(iframeID.length, 21);
});

test('should not remove other attributes', async t => {
  const input = '<link rel="stylesheet" href="style.css">';
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'href');
  const rel = parser(html)[0].attrs.rel;
  t.truthy(id);
  t.truthy(rel);
  t.is(rel, 'stylesheet');
  t.is(url, 'style.css');
  t.is(id.length, 21);
});

test('should not add nano id', async t => {
  const staticID = nanoid();
  const input = `<link rel="stylesheet" href="style.css?v=${staticID}">`;
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'href');
  const rel = parser(html)[0].attrs.rel;
  t.truthy(id);
  t.truthy(rel);
  t.is(rel, 'stylesheet');
  t.is(url, 'style.css');
  t.is(id, staticID);
  t.is(id.length, 21);
});

test('should add nano id for relative path', async t => {
  const staticID = nanoid();
  const input = `<link rel="stylesheet" href="/?v=${staticID}">`;
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'href');
  const rel = parser(html)[0].attrs.rel;
  t.truthy(id);
  t.truthy(rel);
  t.is(rel, 'stylesheet');
  t.is(url, '/');
  t.is(id, staticID);
  t.is(id.length, 21);
});

test('should not add nano id for not url', async t => {
  const input = '<link rel="stylesheet" href="sadsadsadsda">';
  const html = (await processing(input)).html;

  const href = parser(html)[0].attrs.href;
  t.truthy(href);
  t.is(href, 'sadsadsadsda');
});

test('should add nano id for root path', async t => {
  const input = '<link rel="stylesheet" href="/style.css">';
  const html = (await processing(input)).html;

  const {url, id} = getParts(html, 'href');
  const rel = parser(html)[0].attrs.rel;
  t.truthy(id);
  t.truthy(rel);
  t.is(rel, 'stylesheet');
  t.is(url, '/style.css');
  t.is(id.length, 21);
});

function getParts(html, attributeName) {
  const parts = parser(html)[0].attrs[attributeName].split('?');
  const url = parts[0];
  const id = queryString.parse(parts[1]).v;
  return {url, id};
}
