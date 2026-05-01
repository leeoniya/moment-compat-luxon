import assert from 'node:assert/strict';
import test from 'node:test';
import realMoment from 'moment';

import moment from '../src/moment';
import momentTz, { tz } from '../src/moment-timezone';

test('mutable-style chaining matches expected values', () => {
  const a = moment({ year: 2024, month: 0, day: 1 });
  a.add(1, 'day').subtract(2, 'hours');
  assert.equal(a.date(), 1);
  assert.equal(a.hour(), 22);
});

test('month getter/setter is zero-based like moment', () => {
  const ours = moment('2024-03-10T00:00:00Z');
  const theirs = realMoment('2024-03-10T00:00:00Z');

  assert.equal(ours.month(), theirs.month());
  ours.month(0);
  theirs.month(0);
  assert.equal(ours.month(), theirs.month());
});

test('strict parsing accepts matching format and rejects mismatch', () => {
  const strictOk = moment('2026-04-30 17:22', 'yyyy-MM-dd HH:mm', true);
  const strictBad = moment('04/30/2026 17:22', 'yyyy-MM-dd HH:mm', true);
  assert.equal(strictOk.isValid(), true);
  assert.equal(strictBad.isValid(), false);
});

test('fallback parser accepts RFC2822 strings', () => {
  const fallbackRfc = moment('Thu, 30 Apr 2026 17:22:00 +0000');
  assert.equal(fallbackRfc.isValid(), true);
});

test('duration helpers work and align with moment core APIs', () => {
  const ours = moment.duration(90, 'minutes').add(30, 'minutes');
  const theirs = realMoment.duration(90, 'minutes').add(30, 'minutes');
  assert.equal(ours.as('hours'), theirs.as('hours'));
  assert.equal(typeof ours.humanize(), 'string');
});

test('moment + duration interop works', () => {
  const c = moment.utc('2026-04-30T00:00:00Z').add(moment.duration(1, 'day'));
  assert.equal(c.date(), 1);
});

test('day/week compatibility helpers behave as expected', () => {
  const d = moment.utc('2026-04-30T00:00:00Z');
  const dayNumber = d.day();
  assert.equal(typeof dayNumber, 'number');
  if (typeof dayNumber === 'number') {
    assert.equal(dayNumber >= 0 && dayNumber <= 6, true);
  }
  assert.equal(d.weekday(), d.day());
  d.day(0);
  assert.equal(d.day(), 0);
  d.weekday(1);
  assert.equal(d.day(), 1);
  const isoWeek = d.isoWeek();
  assert.equal(typeof isoWeek, 'number');
  if (typeof isoWeek === 'number') {
    assert.equal(isoWeek > 0, true);
  }
});

test('relative helpers return string/null shape', () => {
  const d = moment.utc('2026-04-30T00:00:00Z');
  const rel = d.toNow();
  assert.equal(rel == null || typeof rel === 'string', true);
});

test('format converter supports ordinals', () => {
  const formatted = moment.utc('2026-04-30T10:05:00Z').format('MMMM [the] Do, YYYY');
  assert.equal(formatted.includes('30th'), true);
});

test('moment.tz shim surface is available', () => {
  const guessedZone = moment.tz.guess();
  assert.equal(typeof guessedZone, 'string');
  assert.equal(guessedZone.length > 0, true);

  const utcZone = moment.tz.zone('UTC');
  assert.equal(utcZone != null && utcZone.name === 'UTC', true);

  const zoned = moment.tz('2026-04-30T10:05:00', 'UTC');
  assert.equal(zoned.isValid(), true);

  const names = moment.tz.names();
  assert.equal(names.length > 0, true);
});

test('moment-timezone shim exports default + named tz', () => {
  assert.equal(momentTz.isMoment(momentTz()), true);
  assert.equal(tz.guess().length > 0, true);
});
