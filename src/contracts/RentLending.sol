// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {RealRentToken} from "./RealRentToken.sol";
import {IERC1155Receiver, IERC165} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract RentLending is IERC1155Receiver, OwnerIsCreator, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct LoanDetails {
        uint256 erc1155AmountSupplied;
        uint256 usdcAmountSupplied;
        uint256 usdcAmountLoaned;
        address owner;
        address[] usdcLenders;
        mapping(address usdcLender => uint256)  usdcLendersDetails;
    }

    RealRentToken internal immutable i_realRentToken;
    address internal immutable i_usdc;
    AggregatorV3Interface internal s_usdcUsdAggregator;
    uint32 internal s_usdcUsdFeedHeartbeat;

    mapping(uint256 tokenId => LoanDetails) internal s_activeLoans;


    event LendRWA(uint256 indexed tokenId, uint256 amountRwa, uint256 amountUsdc);
    event Repayed(uint256 indexed tokenId, uint256 amount);
    event LendUSDC(uint256 indexed tokenId, uint256 amount);

    error AlreadyBorrowed(address borrower, uint256 tokenId);
    error OnlyRealRentTokenSupported();
    error InvalidValue();
    error SlippageToleranceExceeded();
    error PriceFeedDdosed();
    error InvalidRoundId();
    error StalePriceFeed();

    constructor(
        address realRentTokenAddress,
        address usdc,
        address usdcUsdAggregatorAddress,
        uint32 usdcUsdFeedHeartbeat
    ) {
        i_realRentToken = RealRentToken(realRentTokenAddress);
        i_usdc = usdc;
        s_usdcUsdAggregator = AggregatorV3Interface(usdcUsdAggregatorAddress);
        s_usdcUsdFeedHeartbeat = usdcUsdFeedHeartbeat;
    }

    function lendRWA(
        uint256 tokenId,
        uint256 amountRwa,
        bytes memory data
    ) external nonReentrant {
        if (s_activeLoans[tokenId].usdcAmountLoaned != 0) revert AlreadyBorrowed(msg.sender, tokenId);

        // 判断输入的 amountUsd 是否合理
        if (amountRwa > i_realRentToken.totalSupply(tokenId) || amountRwa == 0) {
            revert SlippageToleranceExceeded();
        }

        uint256 amountUsdc = getValuationInUsdc(amountRwa);

        if (amountUsdc == 0) revert InvalidValue();

        // rwa owner 出借 rwa token
        i_realRentToken.safeTransferFrom(msg.sender, address(this), tokenId, amountRwa, data);

        // 记录 rwa token 出借信息
        s_activeLoans[tokenId].erc1155AmountSupplied = amountRwa;
        s_activeLoans[tokenId].usdcAmountLoaned = amountUsdc;
        s_activeLoans[tokenId].owner = msg.sender;

        emit LendRWA(tokenId, amountRwa, amountUsdc);
    }

    function lendUSDC(
        uint256 tokenId,
        uint256 amount
    ) external nonReentrant {
        
        if (amount == 0 || amount > s_activeLoans[tokenId].usdcAmountLoaned) {
            revert SlippageToleranceExceeded();
        }

        // 更新贷款信息，记录 usdc token 出借信息
        s_activeLoans[tokenId].usdcAmountLoaned -= amount;
        s_activeLoans[tokenId].usdcLenders.push(msg.sender);
        s_activeLoans[tokenId].usdcLendersDetails[msg.sender] += amount;
        address to = s_activeLoans[tokenId].owner;

        // ERC20转账需要发送给 rwa owner
        IERC20(i_usdc).safeTransferFrom(msg.sender, to, amount);

        emit LendUSDC(tokenId, amount);
    }

    function repay(uint256 tokenId) external nonReentrant {
        
        if( s_activeLoans[tokenId].owner != msg.sender) revert InvalidValue();
        
        for (uint256 i = 0; i < s_activeLoans[tokenId].usdcLenders.length; i++) {
            address usdcLender = s_activeLoans[tokenId].usdcLenders[i];
            uint256 usdcAmount = s_activeLoans[tokenId].usdcLendersDetails[usdcLender];

            if (usdcAmount > 0) {
                // 退还 ERC20 给 usdc lender
                IERC20(i_usdc).safeTransfer(usdcLender, usdcAmount);
            }
        }
        // 取走 ERC1155
        i_realRentToken.safeTransferFrom(address(this), msg.sender, tokenId, s_activeLoans[tokenId].erc1155AmountSupplied, "");

        // 触发事件
        emit Repayed(tokenId, s_activeLoans[tokenId].erc1155AmountSupplied);
        delete s_activeLoans[tokenId];
    }

    function getUsdcPriceInUsd() public view returns (uint256) {
        uint80 _roundId;
        int256 _price;
        uint256 _updatedAt;
        try s_usdcUsdAggregator.latestRoundData() returns (
            uint80 roundId,
            int256 price,
            uint256,
            /* startedAt */
            uint256 updatedAt,
            uint80 /* answeredInRound */
        ) {
            _roundId = roundId;
            _price = price;
            _updatedAt = updatedAt;
        } catch {
            revert PriceFeedDdosed();
        }

        if (_roundId == 0) revert InvalidRoundId();

        if (_updatedAt < block.timestamp - s_usdcUsdFeedHeartbeat) {
            revert StalePriceFeed();
        }

        return uint256(_price);
    }

    function getValuationInUsdc(uint256 amountUsd) public view returns (uint256) {
        uint256 usdcPriceInUsd = getUsdcPriceInUsd();

        uint256 feedDecimals = s_usdcUsdAggregator.decimals();
        uint256 usdcDecimals = 6; // USDC uses 6 decimals

        uint256 normalizedValuation = Math.mulDiv((amountUsd * usdcPriceInUsd), 10 ** usdcDecimals, 10 ** feedDecimals); // Adjust the valuation from USD (Chainlink 1e8) to USDC (1e6)

        return normalizedValuation;
    }

    function setUsdcUsdPriceFeedDetails(address usdcUsdAggregatorAddress, uint32 usdcUsdFeedHeartbeat)
        external
        onlyOwner
    {
        s_usdcUsdAggregator = AggregatorV3Interface(usdcUsdAggregatorAddress);
        s_usdcUsdFeedHeartbeat = usdcUsdFeedHeartbeat;
    }

    function onERC1155Received(
        address, /*operator*/
        address, /*from*/
        uint256, /*id*/
        uint256, /*value*/
        bytes calldata /*data*/
    ) external view returns (bytes4) {
        if (msg.sender != address(i_realRentToken)) {
            revert OnlyRealRentTokenSupported();
        }

        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address, /*operator*/
        address, /*from*/
        uint256[] calldata, /*ids*/
        uint256[] calldata, /*values*/
        bytes calldata /*data*/
    ) external view returns (bytes4) {
        if (msg.sender != address(i_realRentToken)) {
            revert OnlyRealRentTokenSupported();
        }

        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
