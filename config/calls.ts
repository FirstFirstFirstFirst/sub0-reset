import { process } from "std-env";
import { ApiPromise, CHAIN, Chain, magicApi } from "./api";
import { Binary, TxCallData, TxFinalizedPayload } from "polkadot-api";
import { buildAccount, toMultiAddress } from "./account";
import { MultiAddress } from "@polkadot-api/descriptors";

export function makeRemark({ api }: ApiPromise, memo: string): TxCallData {
  const remark = Binary.fromText(memo);
  return api.tx.System.remark({ remark }).decodedCall;
}

type CreateCollectionParams = {
  address: string;
};
export function createCollection(
  { api }: ApiPromise,
  { address }: CreateCollectionParams
): TxCallData {
  const admin = toMultiAddress(address);
  return api.tx.Nfts.create({
    admin,
    config: {
      max_supply: undefined,
      settings: 0n,
      mint_settings: {
        mint_type: {
          type: "Issuer",
          value: undefined,
        },
        start_block: undefined,
        end_block: undefined,
        default_item_settings: 0n,
        price: undefined,
      },
    },
  }).decodedCall;
}

type MintAssetParams = {
  assetId: string;
  beneficiary: MultiAddress;
  amount: string | number | bigint;
};
export function mintAnAsset(
  { api }: ApiPromise,
  params: MintAssetParams
): TxCallData {
  if (!api) {
    throw new Error("API instance is required");
  }

  if (!params.assetId) {
    throw new Error("Asset ID is required");
  }

  if (!params.beneficiary) {
    throw new Error("Beneficiary address is required");
  }

  if (!params.amount) {
    throw new Error("Amount is required");
  }

  try {
    const assetId = process.env.ASSET_ID;
    const tx = api.tx.Assets.mint({
      id: Number(assetId),
      beneficiary: params.beneficiary,
      amount: BigInt(params.amount),
    });
    const txCallData: TxCallData = {
      type: "mint",
      value: {
        type: "Assets",
        value: tx,
      },
    };
    return txCallData;
  } catch (error) {
    throw new Error(`Failed to create mint transaction: ${error.message}`);
  }
}

type MintNonFungibleParams = {
  collectionId: string;
  recipientAddress: string;
  metadata?: string;
  attributes?: Record<string, string>;
  itemId: number;
};

export function mintNonFungible(
  { api }: ApiPromise,
  params: MintNonFungibleParams
): TxCallData {
  if (!params.collectionId || params.collectionId.trim() === "") {
    throw new Error("Collection ID is required");
  }
  const collection = Number(params.collectionId);
  const mint_to = toMultiAddress(params.recipientAddress.toString());
  const item = params.itemId;
  return api.tx.Nfts.mint({
    collection,
    item,
    mint_to,
    witness_data: undefined,
  }).decodedCall;
}

export function sendAssetTo(
  { api }: ApiPromise,
  recipient: string
): TxCallData {
  const dest = toMultiAddress(recipient);
  const assetId = process.env.ASSET_ID;
  return api.tx.Assets.transfer({
    id: Number(assetId),
    target: dest,
    amount: BigInt(1),
  }).decodedCall;
}

export function sendNonFungibleTo(
  { api }: ApiPromise,
  recipient: string,
  collectionId: number
): TxCallData {
  
  const dest = toMultiAddress(recipient);
  const tx = api.tx.Nfts.transfer({
    collection: collectionId,
    item: collectionId,
    dest,
  });
  return tx.decodedCall;
}

export function makeBatch(
  { api }: ApiPromise,
  data: TxCallData | TxCallData[]
): TxCallData {
  const calls = Array.isArray(data) ? data : [data];
  const tx = api.tx.Utility.batch_all({ calls });
  const txCallData: TxCallData = {
    type: "mint",
    value: {
      type: "Assets",
      value: tx,
    },
  };
  return txCallData;
}

enum ProxyType {
  Any = "Any",
  NonTransfer = "NonTransfer",
  CancelProxy = "CancelProxy",
  Assets = "Assets",
  AssetOwner = "AssetOwner",
  AssetManager = "AssetManager",
  Collator = "Collator",
}

// export function createProxy({ api }: ApiPromise): TxCallData {
//   // with `api` object construct a call to create a proxy
//   // the call you are looking for is in the `Proxy` pallet
//   // TODO: remove the throw statement and do return with a call like
//   // `return api.` and the call you are looking for

//   return api.tx.Proxy.add_proxy({
//     delegate: toMultiAddress(process.env.PROXY_ADDRESS || ""),
//     proxy_type: "Any",
//     delay: 0,
//   }).decodedCall;
// }

type ProxyParams = {
  address: string;
};
export function callAsProxy(
  { api }: ApiPromise,
  params: ProxyParams
): TxCallData {
  // with `api` object construct a call as proxy
  // the call you are looking for is in the `Proxy` pallet
  // TODO: remove the throw statement and do return with a call like
  // `return api.` and the call you are looking for
  throw new Error("[UNIMPLEMENTED] callAsProxy");
}

type CallDerivateParams = {
  index: number;
};
export function callAsDerivate(
  { api }: ApiPromise,
  params: CallDerivateParams
): TxCallData {
  // with `api` object construct a call as proxy
  // the call you are looking for is in the `Utility` pallet
  // TODO: remove the throw statement and do return with a call like
  // `return api.` and the call you are looking for
  throw new Error("[UNIMPLEMENTED] callAsDerivate");
}

// 1. check if data is an array or not
// if yes build a batchAll
// if no build a single call
// to sign a call you need signer
// return call.signAndSubmit(signer);
// DEV: how you gonna pass the api it's up to you
export function submit<T>(
  data: TxCallData | TxCallData[],
  chain: Chain = CHAIN
): Promise<TxFinalizedPayload> {
  const { api, disconnect } = magicApi(chain);
  console.log("submit called");

  // Get signer account
  const magicString = process.env.PRIVATE_KEY as string;

  if (!magicString) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }
  const signer = buildAccount(magicString);

  // const connection = magicApi(chain);
  console.log("batching");
  const call = Array.isArray(data)
    ? api.tx.Utility.batch_all({ calls: data })
    : api.tx.Utility.batch({ calls: [data] });
  console.log("calling sign and submit");
  return call.signAndSubmit(signer);
}
