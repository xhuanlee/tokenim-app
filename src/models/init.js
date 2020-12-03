export default {
  namespace: 'init',

  state: {
    showSuccess: false,
    initError: false,

    providerOK: false,
    tokenContractOK: false,
    tokenContractAvaiable: false,
    imContractOK: false,
    imContractAvaiable: false,
    saleContractOK: false,
    saleContractAvaiable: false,
    ensContractOK: false,
    ensContractAvaiable: false,
    faxDomainContractOK: false,
    faxDomainContractAviable: false,
    resolverContractOK: false,
    resolverContractAvaiable: false,
    userDataContractOK: false,
    userDataContractAvaiable: false,

    providerURL: '',
    bzzURL: '',
    apiURL: '',
    tokenContractAddress: '',
    imContractAddress: '',
    saleContractAddress: '',
    ensAddress: '',
    faxDomainAddress: '',
    resolverAddress: '',
    userDataAddress: '',
  },

  effects: {
    *resetNode({ payload: { ethereumNode, swarmNode, apiNode } }, { put, select }) {
      yield put({ type: 'resetInitState' })
      yield put({ type: 'saveInitState', payload: { providerURL: ethereumNode, bzzURL: swarmNode, apiURL: apiNode } })
      window.App.setURL(ethereumNode, swarmNode, apiNode)
    }
  },

  reducers: {
    saveInitState(state, action) {
      // const newState = { ...state, ...action.payload };
      // const { showSuccess, providerOK, tokenContractOK, imContractOK, saleContractOK, ensContractOK, faxDomainContractOK, resolverContractOK, userDataContractOK } = newState;
      // if (!showSuccess && providerOK && tokenContractOK && imContractOK && saleContractOK && ensContractOK && faxDomainContractOK && resolverContractOK && userDataContractOK) {
      //   showNotification('init', 'success')
      //   return { ...state, ...action.payload, showSuccess: true }
      // } else {
      //   return { ...state, ...action.payload };
      // }
      return { ...state, ...action.payload };
    },

    resetTestState(state, action) {
      return {
        ...state,
        initError: false,
        providerOK: false,
        tokenContractOK: false,
        tokenContractAvaiable: false,
        imContractOK: false,
        imContractAvaiable: false,
        saleContractOK: false,
        saleContractAvaiable: false,
        ensContractOK: false,
        ensContractAvaiable: false,
        faxDomainContractOK: false,
        faxDomainContractAviable: false,
        resolverContractOK: false,
        resolverContractAvaiable: false,
        userDataContractOK: false,
        userDataContractAvaiable: false,
        tokenContractAddress: '',
        imContractAddress: '',
        saleContractAddress: '',
        ensAddress: '',
        faxDomainAddress: '',
        resolverAddress: '',
        userDataAddress: '',
      }
    },

    resetInitState(state, action) {
      return {
        initError: false,
        providerOK: false,
        tokenContractOK: false,
        tokenContractAvaiable: false,
        imContractOK: false,
        imContractAvaiable: false,
        saleContractOK: false,
        saleContractAvaiable: false,
        ensContractOK: false,
        ensContractAvaiable: false,
        faxDomainContractOK: false,
        faxDomainContractAviable: false,
        resolverContractOK: false,
        resolverContractAvaiable: false,
        userDataContractOK: false,
        userDataContractAvaiable: false,
        providerURL: '',
        bzzURL: '',
        apiURL: '',
        tokenContractAddress: '',
        imContractAddress: '',
        saleContractAddress: '',
        ensAddress: '',
        faxDomainAddress: '',
        resolverAddress: '',
        userDataAddress: '',
      }
    },
  },

};
