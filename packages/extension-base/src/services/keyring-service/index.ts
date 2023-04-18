// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { CurrentAccountInfo, KeyringState } from '@subwallet/extension-base/background/KoniTypes';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { CurrentAccountStore } from '@subwallet/extension-base/stores';
import { keyring } from '@subwallet/ui-keyring';
import { accounts as accountsObservable } from '@subwallet/ui-keyring/observable/accounts';
import { SubjectInfo } from '@subwallet/ui-keyring/observable/types';
import { BehaviorSubject } from 'rxjs';

export class KeyringService {
  private readonly currentAccountStore = new CurrentAccountStore();
  readonly currentAccountSubject = new BehaviorSubject<CurrentAccountInfo>({ address: '', currentGenesisHash: null });

  private _rawAccountsSubject = accountsObservable.subject;
  readonly addressesSubject = keyring.addresses.subject;
  private beforeAccount: SubjectInfo = this._rawAccountsSubject.value;
  public readonly accountSubject = new BehaviorSubject<SubjectInfo>(this._rawAccountsSubject.value);

  readonly keyringStateSubject = new BehaviorSubject<KeyringState>({
    isReady: false,
    hasMasterPassword: false,
    isLocked: false
  });

  constructor (private eventService: EventService) {
    this.currentAccountStore.get('CurrentAccountInfo', (rs) => {
      this.currentAccountSubject.next(rs);
    });
    this.subscribeAccounts().catch(console.error);
  }

  private async subscribeAccounts () {
    // Wait until account ready
    await this.eventService.waitAccountReady;

    this.beforeAccount = { ...this._rawAccountsSubject.value };

    let accountNextTimeout: NodeJS.Timeout | undefined;

    this._rawAccountsSubject.subscribe((value) => {
      if (accountNextTimeout) {
        clearTimeout(accountNextTimeout);
      }

      // Add some small lazy time to avoid spam
      accountNextTimeout = setTimeout(() => {
        this.accountSubject.next(value);
      }, 99);
    });

    this.accountSubject.subscribe((subjectInfo) => {
      // Check if accounts changed
      const beforeAddresses = Object.keys(this.beforeAccount);
      const afterAddresses = Object.keys(subjectInfo);

      if (beforeAddresses.length > afterAddresses.length) {
        const removedAddresses = beforeAddresses.filter((address) => !afterAddresses.includes(address));

        // Remove account
        removedAddresses.forEach((address) => {
          console.log('account.remove', address);
          this.eventService.emit('account.remove', address);
        });
      } else if (beforeAddresses.length < afterAddresses.length) {
        const addedAddresses = afterAddresses.filter((address) => !beforeAddresses.includes(address));

        // Add account
        addedAddresses.forEach((address) => {
          console.log('account.add', address);
          this.eventService.emit('account.add', address);
        });
      } else {
        // Handle case update later
      }

      this.beforeAccount = { ...subjectInfo };
    });
  }

  get keyringState () {
    return this.keyringStateSubject.value;
  }

  updateKeyringState (isReady = true) {
    if (!this.keyringState.isReady && isReady) {
      this.eventService.emit('keyring.ready', true);
      this.eventService.emit('account.ready', true);
    }

    this.keyringStateSubject.next({
      hasMasterPassword: !!keyring.keyring?.hasMasterPassword,
      isLocked: !!keyring.keyring?.isLocked,
      isReady: isReady
    });
  }

  get accounts (): SubjectInfo {
    return this.accountSubject.value;
  }

  get addresses (): SubjectInfo {
    return this.addressesSubject.value;
  }

  get currentAccount (): CurrentAccountInfo {
    return this.currentAccountSubject.value;
  }

  setCurrentAccount (currentAccountData: CurrentAccountInfo) {
    this.currentAccountSubject.next(currentAccountData);
    this.eventService.emit('account.updateCurrent', currentAccountData);
    this.currentAccountStore.set('CurrentAccountInfo', currentAccountData);
  }
}
