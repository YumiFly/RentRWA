// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155Core} from "./ERC1155Core.sol";
/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract RealRentToken is ERC1155Core {
    
    constructor(
        string memory uri_
    )
      ERC1155Core(uri_)
    {}
}
