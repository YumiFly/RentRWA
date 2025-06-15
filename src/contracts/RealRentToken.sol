// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155Core} from "./ERC1155Core.sol";
import {RealRentPriceDetails} from "./RealRentPriceDetails.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract RealRentToken is ERC1155Core, RealRentPriceDetails {
    
    constructor(
        string memory uri_,
        address ccipRouterAddress,
        address linkTokenAddress,
        uint64 currentChainSelector,
        address functionsRouterAddress
    )
      ERC1155Core(uri_)
      RealRentPriceDetails(functionsRouterAddress) 
    {}
}
