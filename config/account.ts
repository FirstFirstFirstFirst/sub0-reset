import { ed25519 } from "@noble/curves/ed25519"
import { getPolkadotSigner, PolkadotSigner } from "polkadot-api/signer"
import 'dotenv/config'
import { process } from "std-env"
import { getSs58AddressInfo } from "polkadot-api"
import { MultiAddress } from "@polkadot-api/descriptors"
export type Hex = Uint8Array | string;

import * as ss58 from '@subsquid/ss58'

// const formatter = fromBufferToBase58()

export function buildAccount(magicString: string): PolkadotSigner {
	console.log("buildAccount called")
	const seed = magicString;
	const signer = getPolkadotSigner(
		ed25519.getPublicKey(seed),
		"Ed25519",
		(input) => ed25519.sign(input, seed),
	);
	return signer;
}

function getPrivateKey() {
  return process.env.PRIVATE_KEY
}

export function publicKeyOf(seed?: string) {
  let privateKey: Hex | undefined = seed || getPrivateKey()
	if (!privateKey) {
		console.warn('No private key found will use a random one')
		privateKey = ed25519.utils.randomPrivateKey()
		// throw new Error('No private key found')
	}
  return ed25519.getPublicKey(privateKey)
}

/**
 * Check if a value is a hex string
 * @param value - the value to check
**/
export function isHex(value: unknown): value is string {
  return typeof value === 'string' && value.length % 2 === 0 && /^0x[\da-f]*$/i.test(value)
}

/**
 * Decode an ss58 address from the value
 * @param address - the address to decode
**/
export function addressOf(address: Uint8Array): string {
  const value = address
  if (!value) {
    return ''
  }
  return ss58.codec('polkadot').encode(value)
}

export function toMultiAddress(address: string): MultiAddress {
	return MultiAddress.Id(address)
}