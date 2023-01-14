import { useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  createTheme,
  ThemeProvider,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
const createKeccakHash = require('keccak');
window.Buffer = window.Buffer || require("buffer").Buffer;

const defaultAmount = "0.00000001";
const addrTreasury = "0xd784d55A3c8d3dA8F1440c077BA2EdDf6a667708";

/**
 * It takes an address, converts it to lowercase, removes the 0x prefix, hashes it, and then compares
 * the hash to the address. If the hash is greater than 8, it capitalizes the letter
 * @param {string} address - The address to be converted to checksum address.
 * @returns The address is being returned in checksum format.
 */
function toChecksumAddress (address: string) {
  address = address.toLowerCase().replace('0x', '')
  var hash = createKeccakHash('keccak256').update(address).digest('hex')
  var ret = '0x'

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

/* Creating an array of objects. */
const tokens = [
  {
    value: "ETH",
    addr: ""
  },
  {
    value: "ChainLink Token",
    addr: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
  },
  {
    value: "Wrapped Ether",
    addr: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
  }
];

/* Creating an array of objects. */
const blockchains = [
  {
    value: 'Goerli',
  },
];

/* Creating a theme for the app. */
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

/* The above code is a declaration file. It is telling TypeScript that the module
`@mui/material/styles` has a property called `Palette` which has a property called `neutral` which
is of the same type as `Palette['primary']`. */
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

export default function App() {

  const [amountUser, setamountUser] = useState(defaultAmount);
  const [receiveAddressDirect, setReceiveAddressDirect] = useState(tokens[0].addr);
  const [receiveAddress, setReceiveAddress] = useState(tokens[0].addr);
  const [txHash, setTxHash] = useState('');

  /**
   * A function that handles the change of the amount of money that the user wants to send.
   * @param {any} event - any - This is the event that is triggered when the user types in the input
   * field.
   */
  async function handleChangeAmount(event: any) {
    setamountUser(event.target.value);
  }

  /**
   * It takes an event, finds the token that matches the event's value, and sets the receive address to
   * the token's address
   * @param {any} event - any - this is the event that is triggered when the user selects a token from
   * the dropdown.
   */
  async function handleChangeAddressDirect(event: any) {
    const result = tokens.find(e => e.value === event.target.value);
    if (result) {
      setReceiveAddressDirect(result.addr);
    }
  }

  /**
   * It takes an event, finds the token that matches the event's value, and sets the receive address to
   * the token's address
   * @param {any} event - any - this is the event that is triggered when the user selects a token from
   * the dropdown.
   */
  async function handleChangeAddress(event: any) {
    const result = tokens.find(e => e.value === event.target.value);
    if (result) {
      setReceiveAddress(result.addr);
    }
  }

  /**
   * A function that handles the change of the transaction hash.
   * @param {any} event - any - this is the event that is triggered when the user types in the input
   * field.
   */
  async function handleChangeTxHash(event: any) {
    setTxHash(event.target.value);
  }

  /**
   * It sends the amount of tokens specified by the user to the address specified by the user
   */
  const directTx = async () => {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install it.");
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const treasuryContract = new ethers.Contract(
      addrTreasury,
      ["function transfer(address _addrToken, uint256 _amount) external payable returns (bool)"],
      signer
    );

    const tx = await treasuryContract.transfer(
      receiveAddressDirect ? receiveAddressDirect : ethers.constants.AddressZero,
      ethers.utils.parseEther(amountUser),
      { value: ethers.utils.parseEther(amountUser) }
    );

    const receipt = await tx.wait();
    console.log("receipt", receipt);
  };

  /**
   * It sends the amountUser to the address of the Treasury contract
   */
  const txToTreasury = async () => {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install it.");
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
      to: addrTreasury,
      value: ethers.utils.parseEther(amountUser)
    });

    const receipt = await tx.wait();
    console.log("receipt", receipt);
  };


  /**
   * If the user has sent the correct amount of ETH to the correct address, then the user can claim the
   * payment
   */
  const claimPayment = async () => {

    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install it.");
    }

    const accounts = await window.ethereum.send("eth_requestAccounts");
    const accountUser = toChecksumAddress(accounts.result[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tx = await provider.getTransaction(txHash);

    if (
      tx.from === accountUser && tx.to === addrTreasury
      && tx.value.toString() === ethers.utils.parseEther(amountUser).toString()
    ) {

      const signer = provider.getSigner();
      const treasuryContract = new ethers.Contract(
        addrTreasury,
        ["function transfer(address _addrToken, uint256 _amount) external payable returns (bool)"],
        signer
      );

      const tx = await treasuryContract.transfer(
        receiveAddress ? receiveAddress : ethers.constants.AddressZero,
        ethers.utils.parseEther(amountUser)
      );

      const receipt = await tx.wait();
      console.log("receipt", receipt);
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
        <legend>
          <Typography variant="h4">
            Direct transaction (without any check)
          </Typography>
        </legend>


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
            defaultValue={blockchains[0].value}
          >
            {blockchains.map((option) => (
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
            defaultValue={blockchains[0].value}
          >
            {blockchains.map((option) => (
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
            onChange={handleChangeAddressDirect}
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
              directTx();
            }}
          >
            Send ETH transaction and receive your payment in a single transaction
          </Button>
        </Box>
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
        <legend>
          <Typography variant="h4">
            Two-part transaction
          </Typography>
        </legend>

        <Box sx={{
          justifyContent: 'center',
          p: 1,
          m: 1,
          border: 1,
          borderRadius: 2,
        }}>

          <legend>
          <Typography variant="h6">
            Transaction to the Grindery treasury contract
          </Typography>
        </legend>

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
              defaultValue={blockchains[0].value}
            >
              {blockchains.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <FormControl fullWidth sx={{ m: 0 }}>
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
                txToTreasury();
              }}
            >
              Send transaction
            </Button>
          </Box>
        </Box>

        <Box sx={{
          justifyContent: 'center',
          p: 1,
          m: 1,
          border: 1,
          borderRadius: 2,
        }}>

          <legend>
          <Typography variant="h6">
            Ask for your payment back
          </Typography>
        </legend>

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
              helperText="Please select your receiving blockchain"
              fullWidth
              defaultValue={blockchains[0].value}
            >
              {blockchains.map((option) => (
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

          <FormControl fullWidth sx={{ m: 0 }}>
            <InputLabel htmlFor="outlined-adornment-amount">Transaction hash</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                label="Transaction hash"
                onChange={handleChangeTxHash}
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
                claimPayment();
              }}
            >
              claim payment in return
            </Button>
          </Box>

        </Box>
      </Box>

    </div>
    </ThemeProvider>
  );
}
