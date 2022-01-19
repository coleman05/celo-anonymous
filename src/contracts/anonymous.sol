// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Anonymous{
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Text{
        address payable owner;
        string secretText;
        uint likes;
        uint dislikes;
    }

    mapping(uint => Text) internal texts;
    uint textLength = 0;

    function addText(
        string memory _text
    )public{
        Text storage text = texts[textLength];
        text.owner = payable(msg.sender);
        text.secretText = _text;
        text.likes = 0;
        text.dislikes = 0;
        textLength++;
    }

    function getText(uint _index) public view returns(
        address payable,
        string memory,
        uint,
        uint256
    ){
        Text storage text  = texts[_index];
        return (
            text.owner,
            text.secretText,
            text.likes,
            text.dislikes
        );
    }

    function editText(uint _index, string memory newText)public{
        require(msg.sender == texts[_index].owner, "Only for the owner");
        Text storage text = texts[_index];
        text.secretText = newText;
    }

    function likeText(uint _index) public {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                texts[_index].owner,
                100000000000000000
            ),
            "Transaction could not be performed"  
        );
        texts[_index].likes++;
    }
    function dislikeText(uint _index) public {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                texts[_index].owner,
                100000000000000000
            ),
            "Transaction could not be performed"  
        );
        texts[_index].dislikes++;
    }

    function getTextLengnth() public view returns (uint) {
        return (textLength);
    }

}