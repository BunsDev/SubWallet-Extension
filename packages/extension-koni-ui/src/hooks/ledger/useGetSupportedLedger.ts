// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RootState } from '@subwallet/extension-koni-ui/stores';
import { getSupportedLedger } from '@subwallet/extension-koni-ui/utils/account/ledger';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useGetSupportedLedger = () => {
  const { chainInfoMap, chainStateMap } = useSelector((state: RootState) => state.chainStore);

  return useMemo(() => getSupportedLedger(chainInfoMap, chainStateMap), [chainInfoMap, chainStateMap]);
};

export default useGetSupportedLedger;
