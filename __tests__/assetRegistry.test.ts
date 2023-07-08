import AssetRegistry from "../src/utils/assetRegistry";

describe("AssetRegistry", () => {
  test("Getting assets of Polkadot works", async () => {
    const assets = await AssetRegistry.getAssetsOnBlockchain("polkadot", "polkadot");

    expect(assets).toStrictEqual([
      {
        asset: {
          Token: "DOT",
        },
        name: "DOT",
        symbol: "DOT",
        decimals: 10,
        xcmInteriorKey: [
          {
            network: "polkadot",
          },
          "here",
        ],
        inferred: true,
        confidence: 0,
      },
    ]);
  });

  test("Getting assets of Kusama works", async () => {
    const assets = await AssetRegistry.getAssetsOnBlockchain("kusama", "kusama");

    expect(assets).toStrictEqual([
      {
        asset: {
          Token: "KSM",
        },
        name: "KSM",
        symbol: "KSM",
        decimals: 12,
        xcmInteriorKey: [
          {
            network: "kusama",
          },
          "here",
        ],
        inferred: true,
        confidence: 0,
      },
    ]);
  });

  test("xcmInteriorKey to MultiAsset works", () => {
    const ksmXcmInteriorKey = [
      {
        network: "kusama",
      },
      "here",
    ];
  
    expect(
      AssetRegistry.xcmInteriorToMultiAsset(ksmXcmInteriorKey, false),
    ).toStrictEqual({
      parents: 0,
      interior: "Here",
    });
  
    expect(
      AssetRegistry.xcmInteriorToMultiAsset(ksmXcmInteriorKey, true),
    ).toStrictEqual({
      parents: 1,
      interior: "Here",
    });

    const usdcXcmInteriorKey = [
      { network: "polkadot" },
      { parachain: 2000 },
      { generalKey: "0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce" },
    ];

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdcXcmInteriorKey, false),
    ).toStrictEqual({
      parents: 0,
      interior: {
        X2: [
          { parachain: 2000 },
          { generalKey: "0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce" }
        ]
      }
    });

    const usdtXcmInteriorKey = [
      { network: "polkadot" },
      { parachain: 1000 },
      { palletInstance: 50 },
      { generalIndex: 1984 },
    ];

    expect(
      AssetRegistry.xcmInteriorToMultiAsset(usdtXcmInteriorKey, false),
    ).toStrictEqual({
      parents: 0,
      interior: {
        X3: [
          { parachain: 1000 },
          { palletInstance: 50 },
          { generalIndex: 1984 },
        ]
      }
    });
  });

  test("Getting assets on Acala works", async () => {
    const assets = await AssetRegistry.getAssetsOnBlockchain("polkadot", "acala");

    expect(assets).toStrictEqual([
      {
        asset: {
          Erc20: "0x07df96d1341a7d16ba1ad431e2c847d978bc2bce",
        },
        name: "USD Coin (Portal from Ethereum)",
        symbol: "USDCet",
        decimals: 6,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x0207df96d1341a7d16ba1ad431e2c847d978bc2bce" },
        ],
      },
      {
        asset: {
          Erc20: "0x54a37a01cd75b616d63e0ab665bffdb0143c52ae",
        },
        name: "DAI Stablecoin (Portal)",
        symbol: "DAI",
        decimals: 18,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x0254a37a01cd75b616d63e0ab665bffdb0143c52ae" },
        ],
      },
      {
        asset: {
          Erc20: "0x5a4d6acdc4e3e5ab15717f407afe957f7a242578",
        },
        name: "Wrapped Ether (Portal)",
        symbol: "WETH",
        decimals: 18,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x025a4d6acdc4e3e5ab15717f407afe957f7a242578" },
        ],
      },
      {
        asset: {
          Erc20: "0xc80084af223c8b598536178d9361dc55bfda6818",
        },
        name: "Wrapped Bitcoin (Portal)",
        symbol: "WBTC",
        decimals: 8,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x02c80084af223c8b598536178d9361dc55bfda6818" },
        ],
      },
      {
        asset: {
          Erc20: "0xf4c723e61709d90f89939c1852f516e373d418a8",
        },
        name: "ApeCoin (Portal)",
        symbol: "APE",
        decimals: 18,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x02f4c723e61709d90f89939c1852f516e373d418a8" },
        ],
      },
      {
        asset: {
          ForeignAsset: "0",
        },
        name: "Moonbeam",
        symbol: "GLMR",
        decimals: 18,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2004 },
          { palletInstance: 10 },
        ],
      },
      {
        asset: {
          ForeignAsset: "1",
        },
        name: "Parallel",
        symbol: "PARA",
        decimals: 12,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2012 },
          { generalKey: "0x50415241" },
        ],
      },
      {
        asset: {
          ForeignAsset: "10",
        },
        name: "Unique Network",
        symbol: "UNQ",
        decimals: 18,
        xcmInteriorKey: [{ network: "polkadot" }, { parachain: 2037 }],
      },
      {
        asset: {
          ForeignAsset: "11",
        },
        name: "Crust Parachain Native Token",
        symbol: "CRU",
        decimals: 12,
        xcmInteriorKey: [{ network: "polkadot" }, { parachain: 2008 }],
      },
      {
        asset: {
          ForeignAsset: "12",
        },
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 1000 },
          { palletInstance: 50 },
          { generalIndex: 1984 },
        ],
      },
      {
        asset: {
          ForeignAsset: "2",
        },
        name: "Astar Native Token",
        symbol: "ASTR",
        decimals: 18,
        xcmInteriorKey: [{ network: "polkadot" }, { parachain: 2006 }],
      },
      {
        asset: {
          ForeignAsset: "3",
        },
        name: "interBTC",
        symbol: "IBTC",
        decimals: 8,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2032 },
          { generalKey: "0x0001" },
        ],
      },
      {
        asset: {
          ForeignAsset: "4",
        },
        name: "Interlay",
        symbol: "INTR",
        decimals: 10,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2032 },
          { generalKey: "0x0002" },
        ],
      },
      {
        asset: {
          ForeignAsset: "5",
        },
        name: "Wrapped Bitcoin",
        symbol: "WBTC",
        decimals: 8,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 1000 },
          { palletInstance: 50 },
          { generalIndex: 21 },
        ],
      },
      {
        asset: {
          ForeignAsset: "6",
        },
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 1000 },
          { palletInstance: 50 },
          { generalIndex: 100 },
        ],
      },
      {
        asset: {
          ForeignAsset: "7",
        },
        name: "Equilibrium",
        symbol: "EQ",
        decimals: 9,
        xcmInteriorKey: [{ network: "polkadot" }, { parachain: 2011 }],
      },
      {
        asset: {
          ForeignAsset: "8",
        },
        name: "Equilibrium USD",
        symbol: "EQD",
        decimals: 9,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2011 },
          { generalKey: "0x657164" },
        ],
      },
      {
        asset: {
          ForeignAsset: "9",
        },
        name: "Phala Token",
        symbol: "PHA",
        decimals: 12,
        xcmInteriorKey: [{ network: "polkadot" }, { parachain: 2035 }],
      },
      {
        asset: {
          LiquidCrowdloan: "13",
        },
        name: "Liquid Crowdloan DOT",
        symbol: "LcDOT",
        decimals: 10,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x040d000000" },
        ],
      },
      {
        asset: {
          StableAsset: "0",
        },
        name: "Taiga DOT",
        symbol: "tDOT",
        decimals: 10,
      },
      {
        asset: {
          Token: "ACA",
        },
        name: "Acala",
        symbol: "ACA",
        decimals: 12,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x0000" },
        ],
      },
      {
        asset: {
          Token: "AUSD",
        },
        name: "Acala Dollar",
        symbol: "aUSD",
        decimals: 12,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x0001" },
        ],
      },
      {
        asset: {
          Token: "DOT",
        },
        name: "Polkadot",
        symbol: "DOT",
        decimals: 10,
        xcmInteriorKey: [{ network: "polkadot" }, "here"],
      },
      {
        asset: {
          Token: "LDOT",
        },
        name: "Liquid DOT",
        symbol: "LDOT",
        decimals: 10,
        xcmInteriorKey: [
          { network: "polkadot" },
          { parachain: 2000 },
          { generalKey: "0x0003" },
        ],
      },
      {
        asset: {
          Token: "TAP",
        },
        name: "Tapio",
        symbol: "TAP",
        decimals: 12,
      },
    ]);
  });
});
