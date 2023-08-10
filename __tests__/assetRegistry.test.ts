import AssetRegistry from '../src/utils/assetRegistry';

describe('AssetRegistry', () => {
  test('Getting assets of Polkadot works', async () => {
    const assets = await AssetRegistry.getAssetsOnBlockchain(
      'polkadot',
      'polkadot'
    );

    expect(assets).toStrictEqual([
      {
        asset: {
          Token: 'DOT',
        },
        name: 'DOT',
        symbol: 'DOT',
        decimals: 10,
        xcmInteriorKey: [
          {
            network: 'polkadot',
          },
          'here',
        ],
        inferred: true,
        confidence: 0,
      },
    ]);
  });

  test("Checking whether an asset exists on both chains works", async () => {
    const GLMR = [
      {
        network: "polkadot"
      },
      {
        parachain: 2004,
      },
      {
        palletInstance: 10
      }
    ];

    const isGlmrSupported = await AssetRegistry.isSupportedOnBothChains("polkadot", "moonbeam", "acala", GLMR);
    expect(isGlmrSupported).toBe(true);

    const USDC = [
      {
        network: "polkadot"
      },
      {
        parachain: 2004,
      },
      {
        palletInstance: 108
      },
      {
        generalIndex: "0xfd9d0bf45a2947a519a741c4b9e99eb6"
      }
    ];

    const isUsdcSupported = await AssetRegistry.isSupportedOnBothChains("polkadot", "moonbeam", "acala", USDC);
    // Both chains have USDC, but they are not the same.
    expect(isUsdcSupported).toBe(false);

    const USDT = [
      {
        network: "polkadot"
      },
      {
        parachain: 1000,
      },
      {
        palletInstance: 50
      },
      {
        generalIndex: 1984
      }
    ];

    const isUsdtSupported = await AssetRegistry.isSupportedOnBothChains("polkadot", "moonbeam", "acala", USDT);
    expect(isUsdtSupported).toBe(true);
  });

  test("Getting assets of Kusama works", async () => {
    const assets = await AssetRegistry.getAssetsOnBlockchain("kusama", "kusama");

    expect(assets).toStrictEqual([
      {
        asset: {
          Token: 'KSM',
        },
        name: 'KSM',
        symbol: 'KSM',
        decimals: 12,
        xcmInteriorKey: [
          {
            network: 'kusama',
          },
          'here',
        ],
        inferred: true,
        confidence: 0,
      },
    ]);
  });

  test('xcmInteriorKey to MultiAsset works', () => {
    const ksmXcmInteriorKey = [
      {
        network: 'kusama',
      },
      'here',
    ];

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(ksmXcmInteriorKey, false)
    ).toStrictEqual({
      parents: 0,
      interior: 'Here',
    });

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(ksmXcmInteriorKey, true)
    ).toStrictEqual({
      parents: 1,
      interior: 'Here',
    });

    const usdcXcmInteriorKey = [
      { network: 'polkadot' },
      { parachain: 2000 },
      { generalKey: '0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce' },
    ];

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdcXcmInteriorKey, false)
    ).toStrictEqual({
      parents: 0,
      interior: {
        X2: [
          { parachain: 2000 },
          { generalKey: '0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce' },
        ],
      },
    });

    // From the perspective of another parachain:
    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdcXcmInteriorKey, true, 2001)
    ).toStrictEqual({
      parents: 1,
      interior: {
        X2: [
          { parachain: 2000 },
          { generalKey: '0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce' },
        ],
      },
    });

    // From the perspective of the parachain itself the junctions will be different.
    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdcXcmInteriorKey, true, 2000)
    ).toStrictEqual({
      parents: 0,
      interior: {
        X1: [
          { generalKey: '0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce' },
        ],
      },
    });

    const usdtXcmInteriorKey = [
      { network: 'polkadot' },
      { parachain: 1000 },
      { palletInstance: 50 },
      { generalIndex: 1984 },
    ];

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdtXcmInteriorKey, false)
    ).toStrictEqual({
      parents: 0,
      interior: {
        X3: [
          { parachain: 1000 },
          { palletInstance: 50 },
          { generalIndex: 1984 },
        ],
      },
    });
  });
});
