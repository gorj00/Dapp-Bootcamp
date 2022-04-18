pragma solidity ^0.5.0;
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Token {
     using SafeMath for uint;

     // Vars
     string public name = 'DApp Token';
     string public symbol = 'DAPP';
     uint256 public decimals = 18;
     uint256 public totalSupply;

     // Events
     event Transfer(address indexed from, address indexed to, uint256 value);
     event Approval(address indexed owner, address indexed spender, uint256 value);
     
     // Track balances
     mapping(address => uint256) public balanceOf;
     // Sopender was allowed to spend such balances under such addresses (exchanges)
     mapping(address => mapping(address => uint256)) public allowance;

     constructor() public {
          totalSupply = 1000000 * (10 ** decimals);
          balanceOf[msg.sender] = totalSupply;
     }    

     // Send tokens
     function transfer(address _to, uint256 _value) public returns (bool success) {
          require(balanceOf[msg.sender] >= _value);
          _transfer(msg.sender, _to, _value);
          return true;
     }

     // Internal function, may be used only in the contract, cannot be tested
     function _transfer(address _from, address _to, uint256 _value) internal {
          require(_to != address(0)); // address must be valid
          // We decrease the account of the sender, and increate the account of the receiver
          balanceOf[_from] = balanceOf[_from].sub(_value);
          balanceOf[_to] = balanceOf[_to].add(_value);
          emit Transfer(_from, _to, _value);
     }

     // Approve tokens
     function approve(address _spender, uint256 _value) public returns (bool success) {
          require(_spender != address(0)); // address must be valid
          allowance[msg.sender][_spender] = _value;
          emit Approval(msg.sender, _spender, _value);
          return true;
     }

     // Transfer from 
     function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
          require(_value <= balanceOf[_from]);
          require(_value <= allowance[_from][msg.sender]);
          allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
          _transfer(_from, _to, _value);
          return true;
     }


}

