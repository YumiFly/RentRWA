// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {RealRentToken} from "./RealRentToken.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {FunctionsSource} from "./FunctionsSource.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract Issuer is FunctionsClient, FunctionsSource, OwnerIsCreator {
    using FunctionsRequest for FunctionsRequest.Request;

    error LatestIssueInProgress();

    struct FractionalizedNft {
        address to;
        string rwaKey;
        uint256 amount;
    }

    RealRentToken internal immutable i_realRentToken;

    bytes32 internal s_lastRequestId;
    uint256 private s_nextTokenId;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public donID;

    mapping(bytes32 requestId => FractionalizedNft) internal s_issuesInProgress;

    constructor(address realEstateToken, address functionsRouterAddress, uint64 _subscriptionId, uint32 _gasLimit, bytes32 _donID) FunctionsClient(functionsRouterAddress) {
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
        i_realRentToken = RealRentToken(realEstateToken);
    }

    function issue(address to, string calldata rwaKey)
        external
        returns (bytes32 requestId)
    {
        if (s_lastRequestId != bytes32(0)) revert LatestIssueInProgress();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(this.getRentRWAInfo());
        if (args.length > 0) req.setArgs(args);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);

        s_issuesInProgress[requestId] = FractionalizedNft(to, rwaKey, 0);

        s_lastRequestId = requestId;
    }

    function cancelPendingRequest() external onlyOwner {
        s_lastRequestId = bytes32(0);
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (err.length != 0) {
            revert(string(err));
        }

        if (s_lastRequestId == requestId) {
            string memory tokenURI = string(response);

            uint256 tokenId = s_nextTokenId++;
            FractionalizedNft memory fractionalizedNft = s_issuesInProgress[requestId];

            i_realRentToken.mint(fractionalizedNft.to, tokenId, fractionalizedNft.amount, "", tokenURI);

            s_lastRequestId = bytes32(0);
        }
    }
}
