import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareFees, parseAmount } from './fees.mjs';

test('parses ungrouped decimal amounts in integer cents', () => {
    assert.equal(parseAmount(' 120,50 '), 12_050);
    assert.equal(parseAmount('12.5'), 1_250);
    assert.equal(parseAmount('0,01'), 1);
    assert.equal(parseAmount('100000'), 10_000_000);
});

test('rejects ambiguous, out-of-range and nonpositive amounts', () => {
    for (const input of ['', '0', '-2', '100000.01', '1e3', '1.234', '1.234,50', '10,']) {
        assert.equal(parseAmount(input), null, input);
    }
});

test('compares published demonstration rates without losing cents', () => {
    assert.deepEqual(compareFees(10_000), [
        { label: 'Pix', rate: 0, fee: 0, net: 10_000 },
        { label: 'Débito', rate: 99, fee: 99, net: 9_901 },
        { label: 'Crédito à vista', rate: 249, fee: 249, net: 9_751 },
    ]);
    assert.equal(compareFees(5000)[1].fee, 50);
    assert.equal(compareFees(1)[2].fee, 0);
    assert.deepEqual(compareFees(1.2), []);
});
