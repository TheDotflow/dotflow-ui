import IdentityKey from "../src/utils/identityKey";

describe("IdentityKey",() => {
  test("Creating a new cipher works", () => {
    // Identity key would be stored in `window.localStorage`, but in the tests it
    // will simply be stored locally.
    let identityKey = "";

    const polkadotNetworkId = 0;
    identityKey = IdentityKey.newCipher(identityKey, polkadotNetworkId);

    containsNetworkAndCipher(identityKey, polkadotNetworkId);

    const moonbeamNetworkId = 1;
    // Generate a new cipher for the Moonbeam network.
    identityKey = IdentityKey.newCipher(identityKey, moonbeamNetworkId);

    // The identity Key should still have the Polkadot cipher.
    containsNetworkAndCipher(identityKey, polkadotNetworkId);

    containsNetworkAndCipher(identityKey, moonbeamNetworkId);

    // Ciphers are randomly generated so the two ciphers cannot be the same.
    const polkadotCipher = IdentityKey.readNetworkCipher(identityKey, polkadotNetworkId);
    const moonbeamCipher = IdentityKey.readNetworkCipher(identityKey, moonbeamNetworkId);

    expect(polkadotCipher).not.toBe(moonbeamCipher);

    // Cannot create a new Cipher for the same network twice.
    expect(() => IdentityKey.newCipher(identityKey, moonbeamNetworkId))
      .toThrow("There already exists a cipher that is attached to the provided networkId");
  });

  test("Updating cipher works", () => {
    let identityKey = "";

    const polkadotNetworkId = 0;
    const moonbeamNetworkId = 1;

    identityKey = IdentityKey.newCipher(identityKey, polkadotNetworkId);
    identityKey = IdentityKey.newCipher(identityKey, moonbeamNetworkId);

    containsNetworkAndCipher(identityKey, polkadotNetworkId);
    containsNetworkAndCipher(identityKey, moonbeamNetworkId);

    const polkadotCipher = IdentityKey.readNetworkCipher(identityKey, polkadotNetworkId);
    const moonbeamCipher = IdentityKey.readNetworkCipher(identityKey, moonbeamNetworkId);

    identityKey = IdentityKey.updateCipher(identityKey, moonbeamNetworkId);    
    const newMoonbeamCipher = IdentityKey.readNetworkCipher(identityKey, moonbeamNetworkId);

    // The moonbeam network cipher should be updated.
    expect(moonbeamCipher).not.toBe(newMoonbeamCipher);

    // The polkadot cipher shouldn't be affected. 
    expect(IdentityKey.readNetworkCipher(identityKey, polkadotNetworkId)).toBe(polkadotCipher);

    // Cannot update a cipher of a network that does not exist.
    expect(() => IdentityKey.updateCipher(identityKey, 42)).toThrow("Cannot find networkId");
  });
});

const containsNetworkAndCipher = (identityKey: string, networkId: number) => {
  const containsNetwork = new RegExp(`\\b${networkId}:`, "g");
  expect(containsNetwork.test(identityKey)).toBe(true);

  const networkCipher = IdentityKey.readNetworkCipher(identityKey, networkId);
  expect(cipherSize(networkCipher)).toBe(16);
}

const cipherSize = (cipher: string) => Buffer.from(cipher, "base64").length;
