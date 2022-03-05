import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import {
	NETWORK,
	GAS_LIMIT,
	LARVA_MFERS_CONTRACT_ADDRESS,
	ERC721_NAME,
	ERC721_SYMBOL,
	ETHERSCAN_LINK,
	OPENSEA_LINK,
	TWITTER_LINK,
	MAX_SUPPLY,
	FREE_MINT_SUPPLY_LIMIT,
	HOLDER_MINT_SUPPLY_LIMIT,
	MAX_FREE_MINT,
	MAX_PAID_MINT,
	COST,
	WEI_COST,
} from "./config";

import {
	getLarvaMfersContract,
	getMfersContract,
	getLarvaLadsContract,
} from "./utils";

import * as s from "./styles/globalStyles";
import {
	StyledLogo,
	ResponsiveWrapper,
	StyledButton,
	StyledRoundButton,
	StyledLink,
} from "./styles/homepageStyles";

import LinkIcons from "./components/LinkIcons";

function App() {
	const [web3IsAvailable, setWeb3IsAvailable] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [activeAccount, setActiveAccount] = useState();

	const [larvaMferSupply, setLarvaMferSupply] = useState();
	const [freeMintIsActive, setFreeMintIsActive] = useState();
	const [paidMintIsActive, setPaidMintIsActive] = useState();

	const [mferTokenBalance, setMferTokenBalance] = useState();
	const [ladTokenBalance, setLadTokenBalance] = useState();

	const [amountInput, setAmountInput] = useState();

	// Check if the browser supports wallet on page load
	useEffect(() => {
		if (!!window && !!window.ethereum) {
			setWeb3IsAvailable(true);
		} else {
			alert("Heads up! you need to install Metamask to use this app");
		}
	}, []);

	// Fetch required contract states when valid account becomes available
	useEffect(() => {
		if (!!activeAccount) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const larvaMfersContract = getLarvaMfersContract(provider);
			const mfersContract = getMfersContract(provider);
			const larvaLadsContract = getLarvaLadsContract(provider);

			// Get total larva mfer supply
			larvaMfersContract.totalSupply().then(result => {
				setLarvaMferSupply(ethers.utils.formatUnits(result, 0));
			});

			// Get free mint state
			larvaMfersContract.freeMintIsActive().then(result => {
				setFreeMintIsActive(result);
			});

			// Get paid mint state
			larvaMfersContract.paidMintIsActive().then(result => {
				setPaidMintIsActive(result);
			});

			// Check wallet for mfers
			mfersContract.balanceOf(activeAccount).then(result => {
				setMferTokenBalance(ethers.utils.formatUnits(result, 0));
			});

			// Check wallet for Larva Lads
			larvaLadsContract.balanceOf(activeAccount).then(result => {
				setLadTokenBalance(ethers.utils.formatUnits(result, 0));
			});
		}
	}, [activeAccount]);

	const handleNumberInputChange = e => setAmountInput(e.target.value);

	const connectWallet = async () => {
		if (web3IsAvailable) {
			setIsLoading(true);
			try {
				const accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});

				if (parseInt(window.ethereum.networkVersion) !== NETWORK.CHAIN_ID) {
					alert(
						"Invalid chain detected - must connect to the Ethereum Mainnet!"
					);
					setIsLoading(false);
					return;
				}

				if (accounts.length > 0) {
					setActiveAccount(accounts[0]);
					window.ethereum.on("accountsChanged", () => window.location.reload());
					window.ethereum.on("chainChanged", () => window.location.reload());
				} else {
					alert("No valid Ethereum addresses found!");
				}
			} catch (error) {
				console.error(error);
				alert("Error connecting wallet! Are you logged in to MetaMask?");
			}
			setIsLoading(false);
		}
	};

	const freeMint = async () => {
		try {
			if (amountInput > MAX_FREE_MINT) {
				alert("Amount cannot be more than max free mint limit!");
				return;
			}

			setIsLoading(true);
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const larvaMfersContract = getLarvaMfersContract(signer);

			const active = await larvaMfersContract.freeMintIsActive();
			const supplyResult = await larvaMfersContract.totalSupply();
			const supply = ethers.utils.formatUnits(supplyResult, 0);

			if (!active) {
				alert("Unable to complete - free mint not active!");
				setIsLoading(false);
				return;
			}

			if (supply >= FREE_MINT_SUPPLY_LIMIT) {
				alert("Unable to complete - no free mints remaining!");
				setIsLoading(false);
				return;
			}

			await larvaMfersContract.freeMint(amountInput);

			setIsLoading(false);
		} catch (error) {
			console.error(error);
			alert("Error running the free mint function - check the console...");
			setIsLoading(false);
		}
	};

	const paidMint = async () => {
		try {
			if (amountInput > MAX_PAID_MINT) {
				alert("Amount cannot be more than max mint limit!");
				return;
			}

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const larvaMfersContract = getLarvaMfersContract(signer);

			const active = await larvaMfersContract.freeMintIsActive();
			const supplyResult = await larvaMfersContract.totalSupply();
			const supply = ethers.utils.formatUnits(supplyResult, 0);

			if (!active) {
				alert("Unable to complete - mint not active!");
				setIsLoading(false);
				return;
			}

			if (supply >= MAX_SUPPLY) {
				alert("Unable to complete - no available tokens remaining!");
				setIsLoading(false);
				return;
			}

			await larvaMfersContract.mint(amountInput, {
				value: ethers.utils.parseEther(COST),
			});

			setIsLoading(false);
		} catch (error) {
			console.error(error);
			alert("Error running the mint function - check the console...");
			setIsLoading(false);
		}
	};

	const renderContent = () => {
		if (!web3IsAvailable) {
			return (
				<h1>
					please install{" "}
					<a href="https://metamask.io" target="_blank" rel="noreferrer">
						metamask
					</a>
				</h1>
			);
		}

		if (isLoading) {
			return <h1>LOADING...</h1>;
		}

		if (!activeAccount) {
			return (
				<div>
					<button style={{
						padding: "10px",
						borderradius: "50px",
						border: "none",
						backgroundcolor: "black",
						padding: "10px",
						fontweight: "bold",
						color: "000000",
						width: "100px",
						cursor: "pointer",
						boxshadow: "0px 6px 0px -2px rgba(250, 250, 250, 0.3)",
					}}
					onClick={() => connectWallet()}>connect wallet</button>
				</div>
			);
		}

		if (!freeMintIsActive || !paidMintIsActive) {
			return <div><p style={{
				textAlign: "center",
				fontSize: 18,
				fontWeight: "bold",
				  }}
			>mint not active! come back later...</p></div>;
		}

		// FREE HOLDER MINT
		if (larvaMferSupply < HOLDER_MINT_SUPPLY_LIMIT) {
			return (
				<div><p style={{
					textAlign: "center",
					fontSize: 18,
					  }}
				>
					<p>wallet connected:</p>
					<code>{activeAccount}</code>
					<p>
						mfers owned: <code>{mferTokenBalance}</code>
					</p>
					<p>
						larva lads owned: <code>{ladTokenBalance}</code>
					</p>
					<p>supply:</p>
					<code>{`${larvaMferSupply}/${MAX_SUPPLY}`}</code></p>
					<hr />

					{mferTokenBalance > 0 || ladTokenBalance > 0 ? (
						<div><p style={{
							textAlign: "center",
							fontSize: 18,
							  }}
							>
							{mferTokenBalance > 0 && (
								<div>
									<em>mfer hodler detected!</em>
								</div>
							)}
							{ladTokenBalance > 0 && (
								<div>
									<em>larva lad hodler detected!</em>
								</div>
							)}</p>
							<h3>free mint!</h3>
							<input
								onChange={handleNumberInputChange}
								defaultValue={1}
								min={1}
								max={MAX_FREE_MINT}
								type="number"
							/>
							<button onClick={() => freeMint()}>mint</button>
						</div>
					) : (
						<div><p style={{
							textAlign: "center",
							fontSize: 18,
							  }}
						>mint currently for mfer and larva lad hodlers only!</p></div>
					)}
				</div>
			);
		}

		// PUBLIC FREE MINT
		if (
			larvaMferSupply >= HOLDER_MINT_SUPPLY_LIMIT &&
			larvaMferSupply < FREE_MINT_SUPPLY_LIMIT
		) {
			return (
				<div><p style={{
					textAlign: "center",
					fontSize: 18,
					  }}
					>
					<p>wallet connected:</p>
					<code>{activeAccount}</code>
					<p>supply:</p>
					<code>{`${larvaMferSupply}/${MAX_SUPPLY}`}</code></p>
					<hr />
					<h3>free mint!</h3>
					<input
						onChange={handleNumberInputChange}
						defaultValue={1}
						min={1}
						max={MAX_FREE_MINT}
						type="number"
					/>
					<button onClick={() => freeMint()}>mint</button>
				</div>
			);
		}

		// PUBLIC PAID MINT
		if (
			larvaMferSupply >= FREE_MINT_SUPPLY_LIMIT &&
			larvaMferSupply < MAX_SUPPLY
		) {
			return (
				<div><p style={{
					textAlign: "center",
					fontSize: 18,
					  }}
					>
					<p>wallet connected:</p>
					<code>{activeAccount}</code>
					<p>supply:</p>
					<code>{`${larvaMferSupply}/${MAX_SUPPLY}`}</code></p>
					<hr />
					<h3>* paid mint! *</h3>
					<p>
						<em>only</em> {COST} ETH!
					</p>
					<input
						onChange={handleNumberInputChange}
						defaultValue={1}
						min={1}
						max={MAX_PAID_MINT}
						type="number"
					/>
					<button onClick={() => paidMint()}>mint</button>
				</div>
			);
		}

		// DEFAULT (max supply reached)
		return (
			<div><p style={{
				textAlign: "center",
				fontSize: 18,
				  }}
				>
				<p>wallet connected:</p>
				<code>{activeAccount}</code>
				<p>supply:</p>
				<code>{`${larvaMferSupply}/${MAX_SUPPLY}`}</code></p>
				<hr />
				<h3>max supply reached!</h3>
			</div>
		);
	};

	return (
		<s.Screen>
			<s.Container
				flex={1}
				ai={"center"}
				style={{ padding: 24, backgroundColor: "var(--primary)" }}
			>
				<StyledLogo alt={"logo"} src={"/images/larvamferbanner.png"} />
				<s.SpacerSmall />
				<ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
					<s.Container
						flex={2}
						jc={"center"}
						ai={"center"}
						image={"/images/larvamferbest.png"}
					></s.Container>
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
					<s.SpacerSmall />
              		<StyledLink target={"_blank"} href={ETHERSCAN_LINK}>
                		{LARVA_MFERS_CONTRACT_ADDRESS}
              		</StyledLink>
					<s.SpacerSmall />
						{renderContent()}
						
					</s.Container>
					<s.SpacerLarge />
					<s.Container
						flex={2}
						jc={"center"}
						ai={"center"}
						image={"/images/bargain_bin_meme.png"}
					></s.Container>
				</ResponsiveWrapper>

				<LinkIcons/>
				<s.SpacerSmall />
				<s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
					<s.TextDescription>
						LARVA MFERS r generated entirely from hand drawings by
						computerart.eth. this project is in the public domain;
					</s.TextDescription>
					<s.TextDescription>
						feel free to use LARVA MFERS any way u want. inspired by sartoshi.
						image engine and contract by zhoug.eth. site by s34nm4c.eth
					</s.TextDescription>
					<s.SpacerSmall />
					<s.FinePrint
						style={{
							textAlign: "center",
							color: "var(--primary-text)",
						}}
					>
						* please make sure you are connected to the right network (
						{NETWORK.NAME} Mainnet) and the correct address.
					</s.FinePrint>
					<s.FinePrint
						style={{
							textAlign: "center",
							color: "var(--primary-text)",
						}}
					>
						** please note: once you make the purchase, you cannot undo this
						action.
					</s.FinePrint>
				</s.Container>
			</s.Container>
		</s.Screen>
	);
}

export default App;
