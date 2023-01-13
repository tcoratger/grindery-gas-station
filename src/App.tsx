import React, { useState, useEffect } from 'react';
import './App.css';
import { ethers } from 'ethers';
import {ReactComponent as MetamaskLogo} from './images/metamask-logo.svg';
import {
  Box,
  Grid,
  Button,
  createTheme,
  ThemeProvider,
  Typography,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


const defaultAmount = "0.00000001";

const tokens = [
  {
    value: "ETH",
    addr: ""
  },
  // {
  //   value: "USDC",
  //   addr: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
  // },
  // {
  //   value: "USDT",
  //   addr: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9"
  // },
  // {
  //   value: "C7",
  //   addr: "0x32dBd8db20Bfe5506104119EdCC89bc3D8C5c3Ee"
  // },
  // {
  //   value: "T7",
  //   addr: "0x6BABFBA7200f683c267ce892C94e1e110Df390c7"
  // },
  {
    value: "ChainLink Token",
    addr: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
  },
  // {
  //   value: "Goerli Test Token",
  //   addr: "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D"
  // },
  {
    value: "Wrapped Ether",
    addr: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
  }
];


const currencies = [
  // {
  //   value: 'Arbitrum',
  // },
  // {
  //   value: 'Avalanche',
  // },
  // {
  //   value: 'Binance',
  // },
  // {
  //   value: 'Celo',
  // },
  // {
  //   value: 'Ethereum',
  // },
  // {
  //   value: 'Fantom',
  // },
  // {
  //   value: 'Polygon',
  // },
  // {
  //   value: 'Gnosis',
  // },
  // {
  //   value: 'Harmony',
  // },
  // {
  //   value: 'Cronos',
  // },
  {
    value: 'Goerli',
  },

];

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#f44336',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
});

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

// Update the Button's color prop options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}





export default function App() {

  // const [haveMetamask, sethaveMetamask] = useState(true);
  // const [isConnected, setIsConnected] = useState(false);
  // const [accountAddress, setAccountAddress] = useState('');
  // const [accountBalance, setAccountBalance] = useState('');
  const [error, setError] = useState('');
  // const [txs, setTxs] = useState([]);
  const [amountUser, setamountUser] = useState(defaultAmount);
  const [receiveAddress, setReceiveAddress] = useState(tokens[0].addr);

  // const { ethereum } = window;
  // const provider = new ethers.providers.Web3Provider(window.ethereum);

  // /* Checking if the user has metamask installed, if they do, it requests the user's account address
  // and sets it to the state */
  // useEffect(() => {
  //   const { ethereum } = window;
  //   const checkMetamaskAvailability = async () => {
  //     if (!ethereum) {
  //       sethaveMetamask(false);
  //     }
  //     sethaveMetamask(true);
  //   };
  //   checkMetamaskAvailability();
  // }, []);

  /**
   * It checks if the user has metamask installed, if not, it sets the haveMetamask state to false. If
   * the user has metamask installed, it requests the user's account address and balance, and sets the
   * accountAddress and accountBalance states to the user's account address and balance
   */
  // async function requestAccount() {
  //   try {
  //     if (!ethereum) {
  //       sethaveMetamask(false);
  //       throw new Error("No crypto wallet found. Please install it.");
  //     }
  //     const accounts = await ethereum.request({
  //       method: 'eth_requestAccounts',
  //     });
  //     let balance = await provider.getBalance(accounts[0]);
  //     let bal = ethers.utils.formatEther(balance);
  //     setAccountAddress(accounts[0]);
  //     setAccountBalance(bal);
  //     setIsConnected(true);
  //   } catch (error) {
  //     setIsConnected(false);
  //   }
  // };

  // async function connectWallet() {
  //   if (ethereum) {
  //     await requestAccount();
  //     const provider = new ethers.providers.Web3Provider(ethereum);
  //   }
  // }

  async function handleChangeAmount(event: any) {
    setamountUser(event.target.value);
  }

  async function handleChangeAddress(event: any) {

    const result = tokens.find(e => e.value === event.target.value);
    if (result) {
      setReceiveAddress(result.addr);
    }
  }

  const startPayment = async (ether: string, addr: string) => {
    const addrTreasury = "0xd784d55A3c8d3dA8F1440c077BA2EdDf6a667708";
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      const accounts = await window.ethereum.send("eth_requestAccounts");
      const walletAddress = accounts.result[0];
      console.log("accounts: ", accounts.result[0]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      ethers.utils.getAddress(addrTreasury);

      // const tx = await signer.sendTransaction({
      //   to: addrTreasury,
      //   value: ethers.utils.parseEther(ether)
      // });

      // const receipt = await tx.wait();

      const abi = [
        "function transfer(address _addrToken, uint256 _amount) external payable returns (bool)"
      ];

      if (addr) {
        const abi1 = [
          // "function name() public view returns (string)",
          // "function symbol() public view returns (string)",
          // "function decimals() public view returns (uint8)",
          // "function totalSupply() public view returns (uint256)",
          // "function approve(address _spender, uint256 _value) public returns (bool success)",
          "function balanceOf(address account) external view returns (uint256)"
        ]

        const tokenContract = new ethers.Contract(addr, abi1, signer);
        console.log("address token", addr);
        const balance = await tokenContract.balanceOf(addrTreasury);
        console.log("balance contract token", balance.toString());
      }

      const treasuryContract = new ethers.Contract(addrTreasury, abi, signer);

      const addrToken = addr ? addr : ethers.constants.AddressZero;
      const amount = ethers.utils.parseEther(ether);

      console.log("addrToken: " + addrToken);
      console.log("amount: " + amount);
      console.log("--------------------------");

      const tx = await treasuryContract.transfer(
        addrToken,
        amount,
        { value: amount }
      );

      const receipt = await tx.wait();

      console.log("receipt", receipt);



      // if (!addr) {

      //   const amountToUser = "0.0000000000001";

      //   const treasuryContract = new ethers.Contract(addrTreasury, abi, signer);

      //   const tx = await treasuryContract.sendNative(
      //     signer.getAddress(),
      //     ethers.utils.parseEther(ether)
      //   );



      //   // const approveTxUnsigned = await treasuryContract.populateTransaction.sendNative(
      //   //   signer.getAddress(),
      //   //   ethers.utils.parseEther(amountToUser)
      //   // );
      //   // approveTxUnsigned.chainId = (await provider.getNetwork()).chainId;
      //   // approveTxUnsigned.gasLimit = await treasuryContract.estimateGas.sendNative(
      //   //   signer.getAddress(),
      //   //   ethers.utils.parseEther(amountToUser)
      //   // );
      //   // approveTxUnsigned.gasPrice = await provider.getGasPrice();
      //   // approveTxUnsigned.nonce = await provider.getTransactionCount(walletAddress);
      //   // const approveTxSigned = await signer.signTransaction(approveTxUnsigned);

      //   // console.log("approveTxSigned", approveTxSigned)
      //   // const submittedTx = await provider.sendTransaction(approveTxSigned);
      //   // const approveReceipt = await submittedTx.wait();
      //   // if (approveReceipt.status === 0) {
      //   //   throw new Error("Approve transaction failed");
      //   // }




      // }

      // console.log({ ether, addrTreasury });
      // console.log("tx", tx);
      // setTxs([tx] as any);
    } catch (err) {
      setError((err as any).message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        m: 1,
        alignItems: 'center'
       }}>
          <Typography variant="h2">
            Grindery Gas Station
          </Typography>
      </Box>


      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 2,
        m: 2,
        borderRadius: 2,
        bgcolor: '#f5f5f5',
        alignItems: 'center'
      }}>

        <Box sx={{
          display: 'inline-flex',
          justifyContent: 'center',
          p: 1,
          m: 1,
        }}>
          <TextField
            sx={{ m: 2 }}
            id="outlined-select-blockchain"
            select
            label="Select a blockchain"
            helperText="Please select your sending blockchain"
            fullWidth
            defaultValue={currencies[0].value}
          >
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            sx={{ m: 2 }}
            id="outlined-select-blockchain"
            select
            label="Select a blockchain"
            helperText="Please select your receiving blockchain"
            fullWidth
            defaultValue={currencies[0].value}
          >
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            sx={{ m: 2 }}
            id="outlined-select-blockchain"
            select
            label="Select a token"
            helperText="Please select a token to receive your funds"
            fullWidth
            defaultValue={tokens[0].value}
            onChange={handleChangeAddress}
          >
            {tokens.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <FormControl fullWidth sx={{ m: 2 }}>
          <InputLabel htmlFor="outlined-adornment-amount">Amount to send</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">ETH</InputAdornment>}
              label="Amount to send"
              onChange={handleChangeAmount}
              defaultValue={defaultAmount}
              readOnly
            />
        </FormControl>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 1,
          m: 1,
        }}>
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              startPayment(
                amountUser,
                receiveAddress,
              );
            }}
          >
            Send transaction
          </Button>
        </Box>






      </Box>




    </div>
    </ThemeProvider>
  );
}
