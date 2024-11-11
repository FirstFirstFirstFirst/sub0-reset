import { Binary, TxCallData, TxFinalizedPayload } from "polkadot-api";
import { addressOf, buildAccount, publicKeyOf } from "../../config/account";
import { Chain, magicApi } from "../../config/api";
import {
  createCollection,
  makeBatch,
  makeRemark,
  mintNonFungible,
  sendNonFungibleTo,
  submit,
} from "../../config/calls";
import { getNextCollectionId } from "../../config/queries";

// This is you account if you do not have one
// use node run generate
const myAccount = addressOf(publicKeyOf());
console.log("My account:", myAccount);

// We will use AssetHub Paseo, but you can pass any valid
// AssetHub here
const { api, disconnect } = magicApi("ahpas");

const collectionId = await getNextCollectionId({ api });
const recipient = "14UCmdjK31HFULz1J2pbKuTTnRdEhYXQspZMFPmodUWzpPjh";
if (!collectionId) {
  throw new Error("No collection found");
}

// 1. create a new collection
const collection = createCollection({ api }, { address: myAccount });

// 2. mint an nft
const mint = mintNonFungible(
  { api },
  {
    collectionId: collectionId.toString(),
    recipientAddress: myAccount,
    itemId: collectionId,
  }
);

const send = sendNonFungibleTo({ api }, recipient, collectionId);

// 4. construct remark
const remark = makeRemark({ api }, `task_multicall/${myAccount}`);
// 5. sumbit and await for the TX
console.log("start transaction")
const tx = await submit([collection, mint, send, remark]);

// 8. console log the tx
console.log("BLOCK:", tx.block);
console.log("EVENTS:", tx.events);
console.log("HASH:", tx.txHash);
