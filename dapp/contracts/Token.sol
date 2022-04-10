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
     
     // Track balances
     mapping(address => uint256) public balanceOf;


     constructor() public {
          totalSupply = 1000000 * (10 ** decimals);
          balanceOf[msg.sender] = totalSupply;
     }    

     // Send tokens
     function transfer(address _to, uint256 _value) public returns (bool success) {
          require(_to != address(0)); // address must be valid
          require(balanceOf[msg.sender] >= _value);
          // We decrease the account of the sender, and increate the account of the receiver
          balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
          balanceOf[_to] = balanceOf[_to].add(_value);
          emit Transfer (msg.sender, _to, _value);
          return true;
     }

}

