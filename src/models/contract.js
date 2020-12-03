export default {
  namespace: 'contract',

  state: {
    tokenContractLoading: false,
    saleContractLoading: false,
    imContractLoading: false,
    ensContractLoading: false,
    faxDomainContractLoading: false,
    resolverContractLoading: false,
    tokenContractError: false,
    saleContractError: false,
    imContractError: false,
    ensContractError: false,
    faxDomainContractError: false,
    resolverContractError: false,

    tokenAddress: '',
    tokenOwner: '',
    tokenName: '',
    tokenSymbol: '',
    tokenStandard: '',
    tokenTotalSupply: 0,
    tokenOwnerBalance: 0,

    imAddress: '',
    imOwner: '',
    imTokenAdmin: '',
    imRewards: 0,
    imAllowance: 0,
    imMessageCount: 0,

    saleAddress: '',
    saleOwner: '',
    saleTokenAdmin: 0,
    saleTokenPrice: 0,
    saleTokenSold: 0,
    saleAllownce: 0,
    saleContractEther: 0,

    ensAddress: '',
    ensOwner: '',

    faxDomainAddress: '',
    faxDomainOwner: '',
    faxDomainResolver: '',

    resolverAddress: '',
    resolverOwner: '',
  },

  effects: {
    *getContractInfo(_, { put, select }) {
      const initState = yield select(state => state.init);
      const { providerOK, tokenContractOK, imContractOK, saleContractOK, ensContractOK, faxDomainContractOK, resolverContractOK } = initState;
      if (providerOK && tokenContractOK && imContractOK && saleContractOK && ensContractOK && faxDomainContractOK && resolverContractOK) {
        clearInterval(window.tryUntilContractReady);
        yield put({ type: 'saveContractState', payload: { tokenContractLoading: true, saleContractLoading: true, imContractLoading: true, ensContractLoading: true, faxDomainContractLoading: true, resolverContractLoading: true } })
        window.App.getTokenContractStatus();
        window.App.getIMContractStatus();
        window.App.getSaleContractStatus();
        window.App.getENSContractStatus();
        window.App.getFaxDomainContractStatus();
        window.App.getResolverContractStatus();
      } else {
        window.tryUntilContractReady = setInterval(() => {
          const count = window.count || 0;
          if (count > 10) {
            clearInterval(window.tryUntilContractReady)
          }
          window.count = count + 1;
          window.g_app._store.dispatch({ type: 'contract/getContractInfo' })
        }, 2000)
      }
    },
  },

  reducers: {
    saveContractState(state, action) {
      return { ...state, ...action.payload }
    },
  },

};
