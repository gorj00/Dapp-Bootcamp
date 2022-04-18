pragma solidity ^0.5.0;
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import "./Token.sol";

contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage
    mapping(address => mapping(address => uint256)) public tokens; // token => ( user address => amount)

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }
}
