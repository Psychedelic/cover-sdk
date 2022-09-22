import {Ed25519KeyIdentity} from '@dfinity/identity';
import {Principal} from '@dfinity/principal';

import {Cover} from '../src/cover';

describe('Cover production', () => {
  const cover = new Cover(Ed25519KeyIdentity.generate());

  test('verify', async () => {
    expect(await cover.verify(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeDefined();
  });

  test('getAllVerifications', async () => {
    expect(
      await cover.getAllVerifications({
        page_index: BigInt(1),
        items_per_page: BigInt(10)
      })
    ).toBeDefined();
  });

  test('getVerificationStats', async () => {
    expect(await cover.getVerificationStats()).toBeDefined();
  });

  test('getVerificationByCanisterId', async () => {
    expect(await cover.getVerificationByCanisterId(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeDefined();
  });

  test('getCoverHash', async () => {
    expect(await cover.getVerificationByCanisterId(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeDefined();
  });

  test('getICHash', async () => {
    expect(await cover.getICHash(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeDefined();
  });
});