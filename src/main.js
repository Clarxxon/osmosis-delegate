const { SigningCosmosClient, MsgBeginRedelegate, coin, coins, BroadcastMode } = require("@cosmjs/launchpad");
console.log("CONNECT");

window.onload = async () => {
    console.log("CONNECT");
    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // cosmoshub-3 is integrated to Keplr so the code should return without errors.
                // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Cosmos SDK chain.
                    chainId: "akashnet-2",
                    // The name of the chain to be displayed to the user.
                    chainName: "Akash",
                    // RPC endpoint of the chain.
                    rpc: "https://lcd-akash.keplr.app/rpc",
                    // REST endpoint of the chain.
                    rest: "https://lcd-akash.keplr.app/rest",
                    // Staking coin information
                    stakeCurrency: {
                        // Coin denomination to be displayed to the user.
                        coinDenom: "AKT",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "uakt",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                    },
                    // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                    // The 'stake' button in Keplr extension will link to the webpage.
                    // walletUrlForStaking: "",
                    // The BIP44 path.
                    bip44: {
                        // You can only set the coin type of BIP44.
                        // 'Purpose' is fixed to 44.
                        coinType: 118,
                    },
                    // Bech32 configuration to show the address to user.
                    // This field is the interface of
                    // {
                    //   bech32PrefixAccAddr: string;
                    //   bech32PrefixAccPub: string;
                    //   bech32PrefixValAddr: string;
                    //   bech32PrefixValPub: string;
                    //   bech32PrefixConsAddr: string;
                    //   bech32PrefixConsPub: string;
                    // }
                    bech32Config: {
                        bech32PrefixAccAddr: "cosmos",
                        bech32PrefixAccPub: "cosmospub",
                        bech32PrefixValAddr: "cosmosvaloper",
                        bech32PrefixValPub: "cosmosvaloperpub",
                        bech32PrefixConsAddr: "cosmosvalcons",
                        bech32PrefixConsPub: "cosmosvalconspub"
                    },
                    // List of all coin/tokens used in this chain.
                    currencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "AKT",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "uakt",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "AKT",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "uakt",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                    }],
                    // (Optional) The number of the coin type.
                    // This field is only used to fetch the address from ENS.
                    // Ideally, it is recommended to be the same with BIP44 path's coin type.
                    // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                    // So, this is separated to support such chains.
                    coinType: 118,
                    // (Optional) This is used to set the fee of the transaction.
                    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                    gasPriceStep: {
                        low: 0.00,
                        average: 0.001,
                        high: 0.04
                    }
                });
            } catch {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }

    
    const chainId = "akashnet-2";

    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();
    console.log(accounts)
    document.getElementById("address").append(accounts[0].address);
};

document.sendForm.onsubmit = () => {
    let sequence = document.sendForm.sequence.value;
    //let oldval = document.sendForm.oldval.value;
    let amount = document.sendForm.amount.value;
    let account_number = document.sendForm.account_number.value;

    amount = parseFloat(amount);
    if (isNaN(amount)) {
        alert("Invalid amount");
        return false;
    }

    amount *= 1000000;
    amount = Math.floor(amount);

    (async () => {
        // See above.
        const chainId = "akashnet-2";
        await window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSigner(chainId);

        const accounts = await offlineSigner.getAccounts();

        // Initialize the gaia api with the offline signer that is injected by Keplr extension.
        const cosmJS = new SigningCosmosClient(

            "https://lcd-akash.keplr.app/",
            accounts[0].address,
            offlineSigner,
            undefined, undefined,
            "sync"

        );

        //console.log(await cosmJS.getHeight());

        const chain_id = 'akashnet-2';
        const offlineSigner1 = window.getOfflineSigner(chain_id);
        const accounts1 = await offlineSigner1.getAccounts();

        const tx = await offlineSigner1.signAmino(accounts1[0].address, {
            "chain_id": "akashnet-2",
            "account_number": account_number,
            "sequence": sequence,
            "fee": {
                "gas": "250000",
                "amount": [
                    {
                        "denom": "uakt",
                        "amount": "0"
                    }
                ]
            },
            "msgs": [
                {
                    "type": "cosmos-sdk/MsgDelegate",
                    "value": {
                        "delegator_address": accounts1[0].address,
                        //"validator_src_address": oldval,
                        "validator_address": "akashvaloper1ksu368eh54vcqzruqk42dsnx88hvk8px09ws7q",
                        "amount": {
                            "denom": "uakt",
                            "amount": amount+""
                        }
                    }
                }
            ],
            "memo": ""
        }
        );

        console.log(tx);
        const stdTx = { signatures: [tx.signature], msg: tx.signed.msgs, memo: tx.signed.memo, fee: tx.signed.fee };

        const result = cosmJS.broadcastTx(stdTx)
        window.keplr.sendTx(chain_id, stdTx, "sync")

        // const result = await cosmJS.sendTokens(recipient, [{
        //     denom: "uatom",
        //     amount: amount.toString(),
        // }]);

        console.log(result);

        // if (result.code !== undefined &&
        //     result.code !== 0) {
        //     alert("Failed to send tx: " + result.log || result.rawLog);
        // } else {
        //     alert("Succeed to send tx");
        // }
    })();

    return false;
};
