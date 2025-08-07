import Store from 'electron-store';

const schema = {
  browser: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      path: { type: 'string' }
    },
    default: {}
  }
};

const store = new Store({ schema });

export default store;