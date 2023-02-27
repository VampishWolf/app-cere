import { Button, Input, Loading } from "@nextui-org/react";
import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";

interface TokenProps {
  contractAddress: string;
  tokenId: string;
}

export default function Token() {
  interface Metadata {
    name: string;
    description: string;
    image: string;
  }

  interface FileInformation {
    height: number;
    width: number;
    file_size: number;
  }

  interface NFT {
    chain: string;
    contract_address: string;
    token_id: string;
    metadata_url: string;
    metadata: Metadata;
    file_information: FileInformation;
    file_url: string;
    animation_url: string | null;
    cached_file_url: string;
    cached_animation_url: string | null;
    creator_address: string;
    mint_date: string | null;
    updated_date: string;
  }

  const router = useRouter();
  const { query, asPath } = router;

  const tokens = asPath.split("/");

  const contractAddress = tokens[tokens.length - 2];
  const tokenId = tokens[tokens.length - 1];

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork()
  const provider = useProvider()
  
  const { data: signer, isError, isLoading } = useSigner()

  const [nft, setNft] = useState<NFT[]>([]);
  const [errorProof, setErrorProof] = useState<Error | null>(null);
  const [loadingNft, setLoadingNft] = useState<boolean>(false);
  const [nftPrice, setPrice] = useState<Number>(0);

  const ASSET = {
    type: "ERC721",
    tokenAddress: contractAddress,
    tokenId,
  }

  const AMOUNT = {
    type: "ERC20",
    tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    amount: ethers.utils.parseUnits(nftPrice.toString(), "ether"),
  }


  useEffect(() => {
    const fetchNft = async () => {
      setLoadingNft(true);
      try {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "c8e0e790-87a7-410c-b684-62ad610b00b2",
          },
        };

        await fetch(
          `https://api.nftport.xyz/v0/nfts/${contractAddress}/${tokenId}?chain=${chain?.name.toLowerCase()}&refresh_metadata=false`,
          options
        )
          .then((res) => res.json())
          // .then((res) => console.log(res.nft));
          .then((data) => setNft(data.nft));
      } catch (error) {
        console.log(error);
        // setErrorProof(error)
      } finally {
        setLoadingNft(false);
      }
    };
    fetchNft();
  }, [tokenId, contractAddress]);

  
  const nftSwapSdk = new NftSwapV4(provider, signer, chain?.id);

  const checkAllowance = async () => {
    try {
      const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
        ASSET,
        address
      )
      if (approvalStatusForUserA.contractApproved) return true
      else await triggerAllowance()
    } catch (error) {
      console.log(error)
    }
  }

  const triggerAllowance = async () => {
    console.log("inside")
    const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
      ASSET,
      address,
      // {
      //   // These fees can be added via the website too,
      //   // not going in that deep as I might end up making a company :p
      //   maxPriorityFeePerGas: self.gasFee.priorityGasPrice,
      //   maxFeePerGas: self.gasFee.gasPrice,
      //   gasLimit: self.gasFee.gas,
      // }
      )
      const approvalTxReceipt = await approvalTx.wait()
      if (approvalTxReceipt.status) return true
      else return false
  }
  
  const createListing = async () => {
    try {
      await checkAllowance()
      console.log(signer)  
        
      const order = nftSwapSdk.buildOrder(
        // I am offering an NFT
        ASSET,
        // I will receive an ERC20
        AMOUNT,
        // My wallet address
        address
      );
      
      const signedOrder = await nftSwapSdk.signOrder(order);
      
      const postedOrder = await nftSwapSdk.postOrder(signedOrder, chain?.id);
      console.log('postedOrder',postedOrder)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="m-8">
      <div className="flex justify-center gap-80 ">
        <section className="flex flex-col my-4 gap-6">
          <h1 className="font-bold text-2xl my-4">List for Sale</h1>
          <Input 
            color="default"
            labelRight="ETH"
            labelPlaceholder="Price"
            onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
          />
          <Button color="primary" auto onPress={createListing}>
            List
          </Button>
          <Button disabled auto color="primary" css={{ px: "$13" }}>
            <Loading type="points" color="primary" size="sm" />
          </Button>
        </section>
        <section className="flex">
          {nft?.file_url && (
            <div className="flex flex-col w-80 max-w-[300px]">
                <img src={nft?.cached_file_url || nft?.file_url} alt="NFT_IMAGE" />
                <p className="text-lg font-bold">{nft?.token_id}</p>
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}
