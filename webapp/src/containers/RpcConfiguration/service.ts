import * as log from '../../utils/electronLogger';
import {
  DIFF,
  RETRY_ATTEMPT,
  BLOCKCHAIN_START_ERROR,
  BLOCKCHAIN_START_SUCCESS,
  LOADING_BLOCK_INDEX_CODE,
} from '../../constants';
import RpcClient from '../../utils/rpc-client';
import {
  isWalletCreated,
  getBalance,
  checkFundsExistInNonHDWallet,
} from '../../utils/utility';

export const isBlockchainStarted = async (emitter, response) => {
  let retryAttempt = RETRY_ATTEMPT;
  const rpcClient = new RpcClient();
  const intervalRef = setInterval(async () => {
    try {
      const res = await rpcClient.isInitialBlockDownload();
      if (res) {
        emitter({
          status: res,
          message: BLOCKCHAIN_START_SUCCESS,
          conf: response.data.conf,
        });
        clearInterval(intervalRef);
      }
    } catch (err) {
      // Do not decrease retryAttempt in case of loading index
      if (err?.response?.data?.error?.code !== LOADING_BLOCK_INDEX_CODE) {
        retryAttempt -= 1;
      }
      log.error(`Got error in isBlockchainStarted: ${err}`);
      // this causes the channel to close
      if (!retryAttempt) {
        emitter({
          status: false,
          message: BLOCKCHAIN_START_ERROR,
        });
        clearInterval(intervalRef);
      }
    }
  }, DIFF);
};

export const handleCheckFundsExistInNonHDWallet = async () => {
  if (!isWalletCreated()) {
    return false;
  }

  const balance = await getBalance();
  if (balance === 0) {
    return false;
  }

  return await checkFundsExistInNonHDWallet();
};
