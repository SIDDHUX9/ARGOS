// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArgosIndex
 * @notice ERC-20-like index token deployed by the ARGOS Architect agent.
 *         Each deployment represents one SSI index with constituent weights
 *         stored on-chain. Minting is controlled by the deployer (Architect).
 *
 *         This is a minimal ERC-20 — for production use OpenZeppelin's
 *         ERC20 base contract instead.
 */
contract ArgosIndex {
    // ── ERC-20 state ──────────────────────────────────────────────────────────
    string  public name;
    string  public symbol;
    uint8   public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ── Index metadata ────────────────────────────────────────────────────────
    address public architect;   // deployer / rebalancer
    string  public thesis;
    uint256 public deployedAt;
    bool    public paused;

    struct Constituent {
        string symbol;
        uint16 weightBps; // basis points, sum must equal 10000
    }
    Constituent[] public constituents;

    // ── Audit hook ────────────────────────────────────────────────────────────
    address public auditContract; // optional: ArgosAudit address

    // ── Events ────────────────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Rebalanced(uint256 timestamp, Constituent[] newConstituents);
    event Paused(bool state);

    modifier onlyArchitect() {
        require(msg.sender == architect, "Not architect");
        _;
    }

    modifier notPaused() {
        require(!paused, "Index paused");
        _;
    }

    /**
     * @param _name         Index name, e.g. "Copper Supply Shock Index"
     * @param _symbol       Token symbol, e.g. "CSSI"
     * @param _thesis       Investment thesis string
     * @param _symbols      Constituent asset symbols
     * @param _weightsBps   Constituent weights in basis points (must sum to 10000)
     * @param _initialSupply Initial token supply (18 decimals)
     * @param _auditContract Optional ArgosAudit contract address (0x0 to skip)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _thesis,
        string[] memory _symbols,
        uint16[] memory _weightsBps,
        uint256 _initialSupply,
        address _auditContract
    ) {
        require(_symbols.length == _weightsBps.length, "Length mismatch");
        uint256 totalBps;
        for (uint i = 0; i < _weightsBps.length; i++) {
            totalBps += _weightsBps[i];
            constituents.push(Constituent({ symbol: _symbols[i], weightBps: _weightsBps[i] }));
        }
        require(totalBps == 10000, "Weights must sum to 10000 bps");

        name         = _name;
        symbol       = _symbol;
        thesis       = _thesis;
        architect    = msg.sender;
        deployedAt   = block.timestamp;
        auditContract = _auditContract;

        // Mint initial supply to architect
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // ── ERC-20 ────────────────────────────────────────────────────────────────
    function transfer(address to, uint256 amount) external notPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external notPaused returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    // ── Index operations ──────────────────────────────────────────────────────
    /**
     * @notice Rebalance the index with new constituent weights.
     *         Only the Architect can call this.
     */
    function rebalance(
        string[] calldata _symbols,
        uint16[] calldata _weightsBps
    ) external onlyArchitect {
        require(_symbols.length == _weightsBps.length, "Length mismatch");
        uint256 totalBps;
        for (uint i = 0; i < _weightsBps.length; i++) totalBps += _weightsBps[i];
        require(totalBps == 10000, "Weights must sum to 10000 bps");

        delete constituents;
        for (uint i = 0; i < _symbols.length; i++) {
            constituents.push(Constituent({ symbol: _symbols[i], weightBps: _weightsBps[i] }));
        }
        emit Rebalanced(block.timestamp, constituents);
    }

    /**
     * @notice Mint additional index tokens (e.g. when new capital enters).
     */
    function mint(address to, uint256 amount) external onlyArchitect {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @notice Burn index tokens (e.g. on redemption).
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @notice Pause/unpause transfers (Guardian circuit breaker).
     */
    function setPaused(bool _paused) external onlyArchitect {
        paused = _paused;
        emit Paused(_paused);
    }

    /**
     * @notice Return all constituents as arrays (easier for frontend).
     */
    function getConstituents() external view returns (string[] memory syms, uint16[] memory weights) {
        syms    = new string[](constituents.length);
        weights = new uint16[](constituents.length);
        for (uint i = 0; i < constituents.length; i++) {
            syms[i]    = constituents[i].symbol;
            weights[i] = constituents[i].weightBps;
        }
    }
}
