import test from 'node:test';
import assert from 'node:assert/strict';
import {ScanSession,validateSerial} from './session.mjs';
test('preserves leading zeros and allows alphanumeric serials',()=>{assert.equal(validateSerial('00123-ABC'), '');});
test('rejects empty, multiline and oversized barcode payloads',()=>{for(const text of ['', 'abc\ndef','x'.repeat(151)])assert.notEqual(validateSerial(text),'');});
test('late camera permission is immediately released after cancellation',()=>{const session=new ScanSession();let stopped=0;session.stop();assert.equal(session.attachStream({getTracks:()=>[{stop:()=>stopped++}]}),false);assert.equal(stopped,1);});
test('late decoder controls stop after the dialog is closed',()=>{const session=new ScanSession();let stopped=0;session.stop();session.attachControls({stop:()=>stopped++});assert.equal(stopped,1);});
test('closing stops the decoder and every media track',()=>{const session=new ScanSession();let stopped=0;session.attachStream({getTracks:()=>[{stop:()=>stopped++},{stop:()=>stopped++}]});session.attachControls({stop:()=>stopped++});session.stop();assert.equal(stopped,3);});
