import { Button, Input, Loading, Text } from "@nextui-org/react";
import {
  NftSwapV4,
  SignedNftOrderV4Serialized,
  SwappableAssetV4,
} from "@traderxyz/nft-swap-sdk";
import { ethers } from "ethers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";

interface TokenProps {
  contractAddress: string;
  token: string;
}

export default function Token() {
  interface Listing {
    direction: number;
    erc20Token: string;
    erc20TokenAmount: string;
    erc721Token: string;
    erc721TokenId: string;
    erc721TokenProperties: any[];
    expiry: string;
    fees: any[];
    maker: string;
    nonce: string;
    signature: {
      r: string;
      s: string;
      v: number;
      signatureType: number;
    };
  }

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

  const initialNFT: NFT = {
    chain: "",
    contract_address: "",
    token_id: "",
    metadata_url: "",
    metadata: {
      name: "",
      description: "",
      image: "",
    },
    file_information: {
      height: 0,
      width: 0,
      file_size: 0,
    },
    file_url: "",
    animation_url: null,
    cached_file_url: "",
    cached_animation_url: null,
    creator_address: "",
    mint_date: null,
    updated_date: "",
  };

  const router = useRouter();
  const { query, asPath } = router;

  const tokens = asPath.split("/");
  const contractAddress = tokens[tokens.length - 2];
  const tokenId = tokens[tokens.length - 1].slice(
    0,
    tokens[tokens.length - 1].indexOf("?")
  );

  const { nonce, listingId } = query;

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer, isError, isLoading } = useSigner();
  const nftSwap = new NftSwapV4(provider, signer!, chain?.id);

  const [nft, setNft] = useState<NFT>(initialNFT);
  const [listing, setListing] = useState<SignedNftOrderV4Serialized>();
  const [errorProof, setErrorProof] = useState<Error | null>(null);
  const [loadingNft, setLoadingNft] = useState<boolean>(false);
  const [loadingListing, setLoadingListing] = useState<boolean>(false);
  const [txInProcess, setTxInProcess] = useState<boolean>(false);
  const [nftPrice, setPrice] = useState<Number>(0);

  const ASSET: SwappableAssetV4 = {
    type: "ERC721",
    tokenAddress: contractAddress,
    tokenId: tokenId,
  };

  const AMOUNT: SwappableAssetV4 = {
    type: "ERC20",
    tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    amount: ethers.utils.parseUnits(nftPrice.toString(), "ether").toString(),
  };

  useEffect(() => {
    async function fetchListing() {
      setLoadingListing(true);
      if (nonce) {
        try {
          // Search the orderbook for all offers to sell this NFT
          const orders = await nftSwap
            ?.getOrders({
              nonce: nonce?.toString(),
            })
            // .then((data) => console.log(data.orders[0]))
            .then((data) => setListing(data?.orders[0].order));
        } catch (error) {
          console.log(error);
          // setErrorProof(error)
        } finally {
          setLoadingListing(false);
        }
      }
    }
    fetchListing();
  }, [nonce]);

  useEffect(() => {
    const fetchNft = async () => {
      setLoadingNft(true);
      if (contractAddress && tokenId && chain?.name) {
        try {
          const options = {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: "c8e0e790-87a7-410c-b684-62ad610b00b2",
            },
          };

          await fetch(
            `https://api.nftport.xyz/v0/nfts/${contractAddress}/${tokenId}?chain=${chain.name.toLowerCase()}&refresh_metadata=false`,
            options
          )
            .then((res) => res.json())
            .then((data) => setNft(data.nft));
        } catch (error) {
          console.log(error);
          // setErrorProof(error)
        } finally {
          setLoadingNft(false);
        }
      }
    };
    fetchNft();
  }, [tokenId, contractAddress, chain?.name]);

  const checkAllowance = async () => {
    try {
      const approvalStatusForUserA = await nftSwap.loadApprovalStatus(
        AMOUNT,
        address!
      );
      if (approvalStatusForUserA.contractApproved) return true;
      else await triggerAllowance();
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  const triggerAllowance = async () => {
    try {
      const approvalTx = await nftSwap.approveTokenOrNftByAsset(
        AMOUNT,
        address!
      );
      const approvalTxReceipt = await approvalTx.wait();
      if (approvalTxReceipt.status) return true;
      else return false;
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  const fillListing = async () => {
    try {
      setTxInProcess(true);
      if (listing?.maker === address?.toLowerCase()) {
        alert("Cannot buy a token you already own");
        setTxInProcess(false);
        return;
      }
      await checkAllowance();
      const fillTx = await nftSwap.fillSignedOrder(listing!);
      const fillTxReceipt = await nftSwap.awaitTransactionHash(fillTx.hash);
      console.log(
        `🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`
      );
      setTxInProcess(false);
      if (fillTxReceipt.transactionHash) {
        // Delete listing
        await fetch(`/api/listings/${listingId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            console.log("Record deleted successfully");
          })
          .catch((error) => {
            console.error("There was a problem deleting the record:", error);
          });

        alert("Successfully Bought!");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      alert(error);
      setTxInProcess(false);
    }
  };

  return (
    <div className="m-[10%]">
      <div className="flex justify-center gap-40 ">
        <section className="flex flex-col my-4 gap-6 text-white">
          <h1 className="font-bold text-2xl my-4">Buy NFT</h1>
          {/* <Text size="$md">
            {ethers.utils.parseUnits(listing.erc20TokenAmount.toString(), "ethers")}
          </Text> */}
          {/* { listing?.erc20TokenAmount && <Text size="$md">{ethers.utils.parseEther(listing.erc20TokenAmount.toString())}</Text> } */}
          {listing?.erc20TokenAmount && (
            <div className="flex justify-between items-center">
              <p>Listed Price</p>
              <span>{Number(listing?.erc20TokenAmount) / 1e18 + " ETH"}</span>
            </div>
          )}
          {listing?.maker && (
            <div className="flex justify-between items-center gap-6">
              <p>Owner</p>
              <span>{`${listing?.maker.slice(
                0,
                6
              )}...${listing?.maker.slice(-6)}`}</span>
            </div>
          )}
          {txInProcess ? (
            <Button disabled auto color="primary" css={{ px: "$13" }}>
              <Loading type="points" color="primary" size="sm" />
            </Button>
          ) : (
            <Button color="primary" auto onPress={fillListing}>
              Buy
            </Button>
          )}
        </section>
        <section className="flex">
          {nft?.file_url && (
            <div className="flex flex-col w-80 max-w-[300px] rounded-2xl overflow-hidden border border-purple-900">
              <Image
                src={nft?.cached_file_url || nft?.file_url}
                alt="NFT_IMAGE"
                width={400}
                height={400}
              />
              <p className="text-lg font-bold m-2">{nft?.token_id}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
