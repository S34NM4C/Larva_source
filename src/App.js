import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import Tabs from "./components/Tabs";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--secondary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 100%;
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  font-weight: bold;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [freeMintAmount, setFreeMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    MAX_VIP_SUPPLY: 1,
    MAX_FREE_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    VIP_WEI_COST: 0,
    VIP_DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `you're a lucky mfer, you just minted a shiny new ${CONFIG.NFT_NAME}.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const freeNFTs = () => {
    let cost = CONFIG.VIP_WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * freeMintAmount);
    let totalGasLimit = String(gasLimit * freeMintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .freeMint(freeMintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `you're a lucky mfer, you just minted a shiny new ${CONFIG.NFT_NAME}.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const decrementFreeMintAmount = () => {
    let newFreeMintAmount = freeMintAmount - 1;
    if (newFreeMintAmount < 1) {
      newFreeMintAmount = 1;
    }
    setFreeMintAmount(newFreeMintAmount);
  };

  const incrementFreeMintAmount = () => {
    let newFreeMintAmount = freeMintAmount + 1;
    if (newFreeMintAmount > 5) {
      newFreeMintAmount = 5;
    }
    setFreeMintAmount(newFreeMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
      >
        <StyledLogo alt={"logo"} src={"/config/images/larvamferbanner.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container 
            flex={2} 
            jc={"center"} 
            ai={"center"} 
            image={"/config/images/larvamferbest.png"}
            >
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px ridge var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
          <Tabs>
          <div label="hodler mint">
          <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              LARVA MFERS
            </s.TextTitle>
              <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)", fontWeight: "bold" }}>
                 this mint is for MFER and LARVA LAD hodlers only
              </s.TextTitle>
              <s.FinePrint
                  style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                  fontSize: 12,
                  }}
                >
                  i'm serious, if your wallet doesn't contain an OG MFER or LARVA LAD this transaction will fail.  
                  <s.SpacerXSmall />
                  it is a token-gated mint for hodlers only.  mints 2500 - 5000 will be free for the public.
                </s.FinePrint>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_VIP_SUPPLY}
            </s.TextTitle>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_VIP_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  the FREE LARVA MFERS for HODLERs are all gone.
                </s.TextTitle>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  you can still find {CONFIG.NFT_NAME} on
                </s.TextTitle>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
            the first 2500 larva mfers are FREE for MFER and LARVA LAD holders.  if you are not connected to a wallet with one of these nfts please use the public mint function.
                </s.TextTitle>
                <s.FinePrint
                  style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                  fontSize: 12,
                  }}
                >
                  one last time. this will only work if your wallet contains either an OG MFER or LARVA LAD.  
                  <s.SpacerXSmall />
                  maximum of 5 mints per transaction
                </s.FinePrint>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      connect your wallet to the {CONFIG.NETWORK.NAME} network
                    </s.TextTitle>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT WALLET
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementFreeMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {freeMintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementFreeMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          freeNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "MINTING..." : "HODLER ONLY MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  click here to see the collection on opensea.io
              </StyledLink>
            </s.Container> 
          </div>
          <div label="free mint">
          <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              LARVA MFERS
            </s.TextTitle>
              <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" ,fontWeight: "bold"  }}>
                 the first 2500 LARVAMFERS are free for MFER and LARVA LAD holders.<s.SpacerSmall />
                 the next 2500 LARVAMFERS are FREE FOR THE PUBLIC!
              </s.TextTitle>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_FREE_SUPPLY}
            </s.TextTitle>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_FREE_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  the FREE LARVA MFERS are all gone. there will be 5000 more available in batches up to 20 via the public mint.
                </s.TextTitle>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  you can still find {CONFIG.NFT_NAME} on
                </s.TextTitle>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
            we heard that people like free stuff, so what better way to get these little squirmers out to the world then 2500 free mints? get them while supplies last.
                </s.TextTitle>
                <s.FinePrint
                  style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                  fontSize: 12,
                  }}
                >
                  maximum of 5 mints per transaction.
                </s.FinePrint>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      connect your wallet to the {CONFIG.NETWORK.NAME} network
                    </s.TextTitle>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT WALLET
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementFreeMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {freeMintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementFreeMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          freeNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "MINTING..." : "FREE MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  click here to see the collection on opensea.io
              </StyledLink>
            </s.Container> 
          </div>
          <div label="mint">
          <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              LARVA MFERS
            </s.TextTitle>
            <s.TextTitle
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            by computerart.eth
          </s.TextTitle>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
            <s.SpacerXSmall />
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  peep the contract below
                  </s.TextTitle>
                  <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  (zhoug.eth recommends 2 helpings of D.Y.O.R. a day!!) 
                  </s.TextTitle>
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  the LARVAMFERS are all gone :(
                </s.TextTitle>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  you can still find {CONFIG.NFT_NAME} on
                </s.TextTitle>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
            get your LARVA MFER for the low price of 
            {" "}{CONFIG.DISPLAY_COST}{" "}{CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  excluding gas fees.
                </s.TextTitle>
                <s.FinePrint
                  style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                  fontSize: 12,
                  }}
                >
                  maximum of 20 mints per transaction.
                </s.FinePrint>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      connect your wallet to the {CONFIG.NETWORK.NAME} network
                    </s.TextTitle>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT WALLET
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "MINTING..." : "MINT LARVAMFER"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  click here to see the collection on opensea.io
              </StyledLink>
            </s.Container>
          </div>
          </Tabs>
          </s.Container>
          <s.SpacerLarge />
          <s.Container 
            flex={2} 
            jc={"center"} 
            ai={"center"} 
            image={"/config/images/bargain_bin_meme.png"}
            >
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerSmall />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
        <s.TextDescription>
            LARVA MFERS r generated entirely from hand drawings by computerart.eth. this project is in the public domain;
          </s.TextDescription>
          <s.TextDescription>
            feel free to use LARVA MFERS any way u want.  inspired by sartoshi.  image engine and contract by zhoug.eth.  site by s34nm4c.eth
          </s.TextDescription>
          <s.SpacerSmall />
          <s.FinePrint
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            * please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. 
          </s.FinePrint>
          <s.FinePrint
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            ** please note: once you make the purchase, you cannot undo this action.
          </s.FinePrint>
          <s.FinePrint
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            we have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your larva mfer.  we recommend that you don't lower the
            gas limit.
          </s.FinePrint>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
