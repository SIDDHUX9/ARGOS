// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArgosVault
 * @notice Execution vault for the ARGOS Executor agent.
 *         - Accepts ETH deposits
 *         - Records trade intents on-chain (Guardian-approved)
 *         - Emits events consumed by the Audit Trail
 *         - Integrates with ArgosAudit for attestations
 *
 *         For real token swaps wire this to Uniswap V3's
 *         ISwapRouter (address on Sepolia: 0xE592427A0AEce92De3Edee1F18E0157C05861564)
 */

interface IArgosAudit {
    function attest(bytes32 eventHash, string calldata eventType, string calldata summary)
        external returns (uint256);
}

contract ArgosVault {
    // ── State ─────────────────────────────────────────────────────────────────
    address public owner;
    address public guardian;
    address public executor;
    address public auditContract;

    bool    public halted;
    uint256 public maxDailyLossWei;
    uint256 public dailyLossAccum;
    uint256 public lastResetDay;

    struct TradeRecord {
        uint256 id;
        string  pair;
        string  side;
        uint256 amount;
        uint256 price;
        uint256 execPrice;
        int256  slippageBps;
        string  status;
        address executor_;
        uint256 timestamp;
        bytes32 auditHash;
    }

    // Input struct to avoid stack-too-deep in recordTrade
    struct TradeInput {
        string pair;
        string side;
        uint256 amount;
        uint256 price;
        uint256 execPrice;
        int256  slippageBps;
        string  status;
    }

    mapping(uint256 => TradeRecord) public trades;
    uint256 public tradeCount;

    // ── Events ────────────────────────────────────────────────────────────────
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event TradeRecorded(uint256 indexed id, string pair, string side, uint256 amount, string status);
    event GuardianHalt(bool halted, string reason);
    event CircuitBreakerUpdated(uint256 maxDailyLossWei);

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGuardianOrOwner() {
        require(msg.sender == guardian || msg.sender == owner, "Not guardian");
        _;
    }

    modifier onlyExecutorOrOwner() {
        require(msg.sender == executor || msg.sender == owner, "Not executor");
        _;
    }

    modifier notHalted() {
        require(!halted, "Vault halted by Guardian");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(address _guardian, address _executor, address _auditContract) {
        owner         = msg.sender;
        guardian      = _guardian;
        executor      = _executor;
        auditContract = _auditContract;
        lastResetDay  = block.timestamp / 1 days;
    }

    // ── Funding ───────────────────────────────────────────────────────────────
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    // ── Trade recording ───────────────────────────────────────────────────────
    /**
     * @notice Record a Guardian-approved trade on-chain.
     *         Uses a struct input to avoid stack-too-deep.
     *
     * @param input  TradeInput struct with all trade parameters
     */
    function recordTrade(TradeInput calldata input)
        external onlyExecutorOrOwner notHalted returns (uint256 id)
    {
        // Reset daily loss accumulator if new day
        uint256 today = block.timestamp / 1 days;
        if (today > lastResetDay) {
            dailyLossAccum = 0;
            lastResetDay   = today;
        }

        bytes32 auditHash = _buildHash(input);
        id = tradeCount++;

        trades[id] = TradeRecord({
            id:          id,
            pair:        input.pair,
            side:        input.side,
            amount:      input.amount,
            price:       input.price,
            execPrice:   input.execPrice,
            slippageBps: input.slippageBps,
            status:      input.status,
            executor_:   msg.sender,
            timestamp:   block.timestamp,
            auditHash:   auditHash
        });

        _sendAttestation(id, auditHash, input.side, input.pair);

        emit TradeRecorded(id, input.pair, input.side, input.amount, input.status);
    }

    // ── Guardian controls ─────────────────────────────────────────────────────
    function setHalt(bool _halted, string calldata reason) external onlyGuardianOrOwner {
        halted = _halted;
        emit GuardianHalt(_halted, reason);
    }

    function setMaxDailyLoss(uint256 _maxWei) external onlyGuardianOrOwner {
        maxDailyLossWei = _maxWei;
        emit CircuitBreakerUpdated(_maxWei);
    }

    function setGuardian(address _guardian) external onlyOwner {
        guardian = _guardian;
    }

    function setExecutor(address _executor) external onlyOwner {
        executor = _executor;
    }

    function setAuditContract(address _audit) external onlyOwner {
        auditContract = _audit;
    }

    // ── View helpers ──────────────────────────────────────────────────────────
    function getTrade(uint256 id) external view returns (TradeRecord memory) {
        require(id < tradeCount, "Not found");
        return trades[id];
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    function _buildHash(TradeInput calldata t) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            t.pair, t.side, t.amount, t.price, t.execPrice, t.slippageBps, block.timestamp
        ));
    }

    function _buildSummary(uint256 id, string memory side, string memory pair)
        internal pure returns (string memory)
    {
        return string(abi.encodePacked("Trade #", _uint2str(id), " ", side, " ", pair));
    }

    function _sendAttestation(uint256 id, bytes32 auditHash, string memory side, string memory pair) internal {
        if (auditContract == address(0)) return;
        string memory summary = _buildSummary(id, side, pair);
        try IArgosAudit(auditContract).attest(auditHash, "Trade Executed", summary) {} catch {}
    }

    function _uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 tmp = v;
        uint256 digits;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) { digits--; buf[digits] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }
}