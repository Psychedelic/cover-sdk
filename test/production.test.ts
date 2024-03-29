import {Ed25519KeyIdentity} from '@dfinity/identity';
import {Principal} from '@dfinity/principal';

import {Cover} from '../src/cover';

describe('Cover production', () => {
  const cover = new Cover(Ed25519KeyIdentity.generate());

  test('verify', async () => {
    expect(await cover.verify(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeDefined();
  });

  test('getStats', async () => {
    expect(await cover.getVerificationStats()).toBeDefined();
  });

  test('getMyStats', async () => {
    expect(await cover.getMyVerificationStats()).toBeDefined();
  });

  test('getActivities', async () => {
    expect(
      await cover.getActivities({
        page_index: BigInt(1),
        items_per_page: BigInt(10)
      })
    ).toBeDefined();
  });

  test('getMyActivities', async () => {
    expect(
      await cover.getMyActivities({
        page_index: BigInt(1),
        items_per_page: BigInt(10)
      })
    ).toBeDefined();
  });

  test('getMyBuildConfigs', async () => {
    expect(await cover.getMyBuildConfigs()).toBeDefined();
  });

  test('getMyBuildConfigById', async () => {
    expect(await cover.getMyBuildConfigById(Principal.from('3x7en-uqaaa-aaaai-abgca-cai'))).toBeUndefined();
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

  test('coverMetadata', async () => {
    expect(await cover.coverMetadata(Principal.from('iftvq-niaaa-aaaai-qasga-cai'))).toBeDefined();
  });

  test('anonymousCoverMetadata', async () => {
    expect(await Cover.anonymousCoverMetadata(Principal.from('iftvq-niaaa-aaaai-qasga-cai'))).toBeDefined();
  });
});
