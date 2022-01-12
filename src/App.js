import "./App.css";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";

import anonymous from "./contracts/anonymous.abi.json";
import IERC from "./contracts/ierc.abi.json";

const ERC20_DECIMALS = 18;

const contractAddress = "0xD1e7D2c0746677f93c58dede8B1804CfAAD74c93";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [secrets, setSecrets] = useState([]);
  const [secretText, setSecretText] = useState("");

  const celoConnect = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];

        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
        console.log(user_address);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Error");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(anonymous, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  }, [address, kit]);
  const getSecrets = async () => {
    const textLength = await contract.methods.getTextLengnth().call();
    const _texts = [];

    for (let index = 0; index < textLength; index++) {
      let _text = new Promise(async (resolve, reject) => {
        let text = await contract.methods.getText(index).call();
        resolve({
          index: index,
          owner: text[0],
          secretText: text[1],
          likes: text[2],
          dislikes: text[3],
          revealed: text[4],
        });
      });
      _texts.push(_text);
    }
    const texts = await Promise.all(_texts);
    setSecrets(texts);
  };

  const likeSecret = async (_index) => {
    const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);

    try {
      const price = new BigNumber(1).shiftedBy(ERC20_DECIMALS).toString();
      await cUSDContract.methods
        .approve(contractAddress, price)
        .send({ from: address });
      await contract.methods.likeText(_index).send({ from: address });
      getBalance();
      getSecrets();
    } catch (error) {
      console.log(error);
    }
  };

  const dislikeSecret = async (_index) => {
    const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);
    try {
      const price = new BigNumber(1).shiftedBy(ERC20_DECIMALS).toString();
      await cUSDContract.methods
        .approve(contractAddress, price)
        .send({ from: address });
      await contract.methods.dislikeText(_index).send({ from: address });
      getBalance();
      getSecrets();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await contract.methods.addText(secretText).send({ from: address });
    } catch (error) {
      console.log(error);
    }
    setSecretText("")
    getSecrets();
  };

  useEffect(() => {
    celoConnect();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    } else {
      console.log("no kit");
    }
  }, [kit, address]);

  useEffect(() => {
    if (contract) {
      console.log(contract);
      getSecrets();
    }
  }, [contract]);
  return (
    <div>
      <div>
        <div className="navbar-area fixed-top">
          <div className="mobile-nav">
            <h2>Anonymous</h2>
          </div>
          <div className="main-nav">
            <div className="container">
              <nav className="navbar navbar-expand-md navbar-light">
                <h2>Anonymous</h2>
                <div
                  className="collapse navbar-collapse mean-menu"
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                      <a href="#" className="nav-link">
                        Home
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="cmn-btn">
                  <a className="banner-btn-left" href="#">
                    Balance:{cUSDBalance} cUSD
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className="page-title-area">
          <img src="assets/img/home-one/footer-car.png" alt="Title" />
          <div className="container">
            <div className="page-title-content">
              <h2>Tell thy Secrets</h2>
            </div>
          </div>
        </div>
        <section className="parts-area pt-100 pb-70">
          <div className="container">
            <div className="section-title">
              <h2>Secrets</h2>
            </div>
            <div id="container" className="row">
              {secrets.map((secret) => (
                <div className="col-sm-6 col-lg-3 mix ui tyre">
                  <div className="parts-item">
                    {/* <div className="parts-top">
                    <img src="assets/img/home-one/parts/1.png" alt="Parts" />
                  </div> */}
                    {/* <h3>Audeck Tyre 200</h3> */}
                    {
                      <span>
                        <p>{secret.secretText}</p>
                      </span>
                    }
                    <div className="d-flex justify-content-between">
                      <p>{secret.likes} likes</p>
                      <p>{secret.dislikes} Dislikes</p>
                    </div>
                    <div className="d-flex justify-content-between">
                      <div className="" style={{}}>
                        <i
                          onClick={() => likeSecret(secret.index)}
                          className="bx bx-like"
                        ></i>
                      </div>
                      <div
                        onClick={() => dislikeSecret(secret.index)}
                        className=""
                        style={{}}
                      >
                        <i className="bx bx-dislike"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="contact-area pt-100 pb-70">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="contact-item contact-right">
                  <h3>Tell your Secret</h3>
                  <form id="contactForm" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12 col-lg-12">
                        <div className="form-group">
                          <textarea
                            onChange={(e) => setSecretText(e.target.value)}
                            name="message"
                            className="form-control"
                            id="message"
                            cols={30}
                            rows={8}
                            required
                            placeholder="Write your secret"
                            defaultValue={""}
                          />
                          <div className="help-block with-errors" />
                        </div>
                      </div>
                      <div className="col-md-12 col-lg-12">
                        <button type="submit" className="contact-btn btn">
                          Send
                        </button>
                        <div id="msgSubmit" className="h3 text-center hidden" />
                        <div className="clearfix" />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
