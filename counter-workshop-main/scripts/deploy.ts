import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
  });

  // initialize existing predeployed account 0
  console.log("ACCOUNT_ADDRESS=", 0x0619FBF40C9DCbBB86Bd99753882E0a0f1F1e99Df347A4565F8A7C0750cd81CB);
  console.log("ACCOUNT_PRIVATE_KEY=", 0x065af39bee4517dbd4eddb36b764b04ceb6b23a96b84eb2647b94c738c62dc4c);
  const privateKey0 = "0x065af39bee4517dbd4eddb36b764b04ceb6b23a96b84eb2647b94c738c62dc4c";
  const accountAddress0: string = "0x0619FBF40C9DCbBB86Bd99753882E0a0f1F1e99Df347A4565F8A7C0750cd81CB";
  const account0 = new Account(provider, accountAddress0, privateKey0);
  console.log("Account connected.\n");

  // Declare & deploy contract
  let sierraCode, casmCode;

  try {
    ({ sierraCode, casmCode } = await getCompiledCode("workshop_Counter"));
  } catch (error: any) {
    console.log("Failed to read contract files");
    process.exit(1);
  }

  const myCallData = new CallData(sierraCode.abi);
  const constructor = myCallData.compile("constructor", {
    counter: 100,
    kill_switch:
      "0x05f7151ea24624e12dde7e1307f9048073196644aa54d74a9c579a257214b542",
    initial_owner: "0x0619FBF40C9DCbBB86Bd99753882E0a0f1F1e99Df347A4565F8A7C0750cd81CB",
  });
  const deployResponse = await account0.declareAndDeploy({
    contract: sierraCode,
    casm: casmCode,
    constructorCalldata: constructor,
    salt: stark.randomAddress(),
  });

  // Connect the new contract instance :
  const myTestContract = new Contract(
    sierraCode.abi,
    deployResponse.deploy.contract_address,
    provider
  );
  console.log(
    `✅ Contract has been deploy with the address: ${myTestContract.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
