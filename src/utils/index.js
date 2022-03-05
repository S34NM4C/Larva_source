import { ethers } from "ethers";

import abiLarvaMfers from "../config/abi/larva-mfers.json";
import abiMfers from "../config/abi/mfers.json";
import abiLarvaLads from "../config/abi/larva-lads.json";

import {
	LARVA_MFERS_CONTRACT_ADDRESS,
	MFERS_CONTRACT_ADDRESS,
	LARVA_LADS_CONTRACT_ADDRESS,
} from "../config";

export const getLarvaMfersContract = provider => {
	return new ethers.Contract(
		LARVA_MFERS_CONTRACT_ADDRESS,
		abiLarvaMfers,
		provider
	);
};

export const getMfersContract = provider => {
	return new ethers.Contract(MFERS_CONTRACT_ADDRESS, abiMfers, provider);
};

export const getLarvaLadsContract = provider => {
	return new ethers.Contract(
		LARVA_LADS_CONTRACT_ADDRESS,
		abiLarvaLads,
		provider
	);
};
