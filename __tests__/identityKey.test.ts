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
    const polkadotCipher = IdentityKey.getNetworkCipher(identityKey, polkadotNetworkId);
    const moonbeamCipher = IdentityKey.getNetworkCipher(identityKey, moonbeamNetworkId);

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

    const polkadotCipher = IdentityKey.getNetworkCipher(identityKey, polkadotNetworkId);
    const moonbeamCipher = IdentityKey.getNetworkCipher(identityKey, moonbeamNetworkId);

    identityKey = IdentityKey.updateCipher(identityKey, moonbeamNetworkId);    
    const newMoonbeamCipher = IdentityKey.getNetworkCipher(identityKey, moonbeamNetworkId);

    // The moonbeam network cipher should be updated.
    expect(moonbeamCipher).not.toBe(newMoonbeamCipher);

    // The polkadot cipher shouldn't be affected. 
    expect(IdentityKey.getNetworkCipher(identityKey, polkadotNetworkId)).toBe(polkadotCipher);

    // Cannot update a cipher of a network that does not exist.
    expect(() => IdentityKey.updateCipher(identityKey, 42)).toThrow("Cannot find networkId");
  });

  test("Encryption and decryption works", () => {
    let identityKey = "";

    const polkadotNetworkId = 0;
    identityKey = IdentityKey.newCipher(identityKey, polkadotNetworkId);

    containsNetworkAndCipher(identityKey, polkadotNetworkId);

    const polkadotAddress = "126X27SbhrV19mBFawys3ovkyBS87SGfYwtwa8J2FjHrtbmA";
    const encryptedAddress = IdentityKey.encryptAddress(identityKey, polkadotNetworkId, polkadotAddress);
    const decryptedAddress = IdentityKey.decryptAddress(identityKey, polkadotNetworkId, encryptedAddress);

    expect(polkadotAddress).toBe(decryptedAddress);
  });
});

const containsNetworkAndCipher = (identityKey: string, networkId: number) => {
  const containsNetwork = new RegExp(`\\b${networkId}:`, "g");
  expect(containsNetwork.test(identityKey)).toBe(true);

  const networkCipher = IdentityKey.getNetworkCipher(identityKey, networkId);
  expect(cipherSize(networkCipher)).toBe(16);
}

const cipherSize = (cipher: string) => Buffer.from(cipher, "base64").length;
