import { OPENSEA_LINK, ETHERSCAN_LINK, TWITTER_LINK } from "../config";

import svgOpenSeaLogo from "../icons/os-logo.svg";
import svgEtherscanLogo from "../icons/etherscan-logo.svg";
import svgTwitterLogo from "../icons/twitter-logo.svg";

import './link-icon.css'



const LinkIcons = () => {
	return (
		<div className='linkGroup'>
			<a href={OPENSEA_LINK} target="_blank" rel="noopener noreferrer">
				<img src={svgOpenSeaLogo} alt="Opensea logo icon" className='linkImg' />
			</a>

			<a href={ETHERSCAN_LINK} target="_blank" rel="noopener noreferrer">
				<img
					src={svgEtherscanLogo}
					alt="Etherscan logo icon"
					className='linkImg'
				/>
			</a>

			<a href={TWITTER_LINK} target="_blank" rel="noopener noreferrer">
				<img src={svgTwitterLogo} alt="Twitter logo icon" className='linkImg' />
			</a>
		</div>
	);
};

export default LinkIcons;
