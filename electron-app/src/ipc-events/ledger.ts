import { ipcMain } from 'electron';
import { GET_LEDGER_DEFI_PUB_KEY, CONNECT_LEDGER, LIST_DEVICES_LEDGER } from '../constants';
import { responseMessage } from '../utils';
import Wallet from '../controllers/wallets';
import DefiHwWallet from '../defiHwWallet/defiHwWallet';

const DefiLedger = new DefiHwWallet();

const initiateLedger = () => {
  ipcMain.on(GET_LEDGER_DEFI_PUB_KEY, async (event: Electron.IpcMainEvent) => {
    try {
      const wallet = new Wallet();
      // TODO Replace the query logic when the connection is ready to Ledger
      event.returnValue = await wallet.connectHwWallet();
    } catch (err) {
      event.returnValue = responseMessage(false, {
        message: err.message,
      });
    }
  });

  ipcMain.on(CONNECT_LEDGER, async (event: Electron.IpcMainEvent) => {
    try {
      await DefiLedger.connect();
      event.returnValue = responseMessage(true, {
        isConnected: DefiLedger.connected,
      });
    } catch (err) {
      event.returnValue = responseMessage(false, {
        message: err.message,
        isConnected: DefiLedger.connected,
      });
    }
  });

  ipcMain.on(LIST_DEVICES_LEDGER, async (event: Electron.IpcMainEvent) => {
    try {
      const devices = await DefiLedger.getDevices();
      event.returnValue = responseMessage(true, {
        devices,
      });
    } catch (err) {
      event.returnValue = responseMessage(false, {
        message: err.message,
      });
    }
  });
};

export default initiateLedger;
